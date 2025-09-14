import pandas as pd
import joblib
import os
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_recall_curve,
    roc_auc_score,
    average_precision_score
)
import numpy as np
from typing import Tuple

# Paths
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "isolation_forest.pkl")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "preprocessor.pkl")
TEST_FILE = os.path.join(BASE_DIR, "synthetic_testset.csv")
RESULTS_FILE = os.path.join(BASE_DIR, "synthetic_results.csv")


def load_data(file_path: str) -> pd.DataFrame:
    """Loads a CSV file into a pandas DataFrame."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Test set file not found: {file_path}")
    print(f"[*] Loading test set: {file_path}")
    df = pd.read_csv(file_path, low_memory=False)
    print(f"[*] Loaded test set: {df.shape[0]} rows, {df.shape[1]} columns")
    return df


def evaluate_model(model, preprocessor, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Evaluates the model and tunes the classification threshold."""
    if "label" not in df.columns:
        raise ValueError("Test set must contain a 'label' column with ground truth (1=normal, -1=anomaly)")

    X_raw = df.drop(columns=["label"])
    y_true = df["label"].values

    # Get the list of numeric features from the preprocessor's configuration
    # This is a robust way to ensure we handle the correct columns
    numeric_features = [col for (name, pipe, col) in preprocessor.transformers_ if name == 'numerical'][0]
    
    # Coerce numeric columns to a numeric type, handling errors by converting to NaN
    for col in numeric_features:
        if col in X_raw.columns:
            X_raw[col] = pd.to_numeric(X_raw[col], errors='coerce')

    # Transform features using the saved preprocessor
    X_trans = preprocessor.transform(X_raw)

    # Get raw anomaly scores
    # Note: higher score means more normal, so we invert for metrics where higher=positive
    scores = model.decision_function(X_trans)

    # Tune threshold using precision-recall curve on inverted scores
    precision, recall, thresholds = precision_recall_curve(y_true, -scores)
    f1_scores = 2 * (precision * recall) / (precision + recall + 1e-6)

    best_idx = np.argmax(f1_scores)
    
    # Handle case where F1 scores are all zero (e.g., no true anomalies in test set)
    if f1_scores[best_idx] == 0:
        best_threshold = 0.0
        print("\n[!] Warning: No anomalies detected in test set. Setting threshold to 0.")
    else:
        best_threshold = thresholds[best_idx]

    print("\n=== Threshold tuning results ===")
    print(f"Best threshold: {-best_threshold:.4f}")  # Invert back for interpretation
    print(f"Precision at best: {precision[best_idx]:.4f}")
    print(f"Recall at best   : {recall[best_idx]:.4f}")
    print(f"F1-score at best : {f1_scores[best_idx]:.4f}")

    # Apply tuned threshold to get predicted labels
    y_pred = np.where(scores < -best_threshold, -1, 1)

    return y_true, y_pred, scores, f1_scores[best_idx]


def main():
    """Main function to load artifacts, run evaluation, and report results."""
    try:
        # Load artifacts
        print("[*] Loading trained model and preprocessor...")
        model = joblib.load(MODEL_PATH)
        preprocessor = joblib.load(PREPROCESSOR_PATH)
        print("[+] Artifacts loaded successfully.")

        # Load data
        df = load_data(TEST_FILE)

        # Run evaluation and get predictions
        y_true, y_pred, scores, best_f1 = evaluate_model(model, preprocessor, df)

        # Evaluation metrics
        print("\n[+] Confusion Matrix:")
        print(confusion_matrix(y_true, y_pred))

        print("\n[+] Classification Report:")
        print(classification_report(y_true, y_pred, zero_division=0))

        # ROC-AUC: Good for measuring model's ability to rank anomalies across all thresholds.
        roc_auc = roc_auc_score(y_true, -scores)
        # PR-AUC: More informative than ROC-AUC for highly imbalanced datasets.
        pr_auc = average_precision_score(y_true, -scores)

        print("=== Evaluation metrics ===")
        print(f"ROC-AUC : {roc_auc:.4f}")
        print(f"PR-AUC  : {pr_auc:.4f}")

        # Save detailed results to CSV
        df_results = df.copy()
        df_results["anomaly_score"] = scores
        df_results["predicted_label"] = y_pred
        df_results.to_csv(RESULTS_FILE, index=False)
        print(f"\n[+] Saved detailed results to {RESULTS_FILE}")

    except FileNotFoundError as e:
        print(f"[!] Error: {e}")
        print("[!] Please ensure the model, preprocessor, and test data files exist in the same directory.")
    except Exception as e:
        print(f"[!] An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()