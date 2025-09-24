import pandas as pd
import joblib
import os
from sklearn.metrics import (
    confusion_matrix,
    precision_recall_curve,
    roc_auc_score,
    average_precision_score,
    classification_report,
    matthews_corrcoef
)
import numpy as np
from typing import Tuple

# --- Paths ---
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "isolation_forest.pkl")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "preprocessor.pkl")
TEST_FILE = os.path.join(BASE_DIR, "synthetic_testset.csv")
RESULTS_FILE = os.path.join(BASE_DIR, "isofor_results_evaluation.csv")

def load_data(file_path: str) -> pd.DataFrame:
    """Load and return the test dataset."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Test file not found: {file_path}")
    df = pd.read_csv(file_path, low_memory=False)
    print(f"[+] Test set loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    return df

def ensure_columns(df: pd.DataFrame, expected_cols: list) -> pd.DataFrame:
    """Adds missing columns with default values."""
    missing = set(expected_cols) - set(df.columns)
    if missing:
        print(f"[!] Warning: Missing columns in test set: {missing}. Filling with default values.")
        for col in missing:
            df[col] = 0 if col.startswith("num_") else "missing"
    return df[expected_cols]

def evaluate_model(model, preprocessor, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, float]:
    """Evaluates the model and tunes the classification threshold."""
    if "label" not in df.columns:
        raise ValueError("Test set must contain a 'label' column (1=normal, -1=anomaly)")

    y_true = df["label"].values
    X_raw = df.drop(columns=["label"])

    # Ensure all expected preprocessor columns exist
    expected_cols = []
    for name, transformer, cols in preprocessor.transformers_:
        expected_cols.extend(cols)
    X_raw = ensure_columns(X_raw, expected_cols)

    # Transform features using the saved preprocessor
    X_trans = preprocessor.transform(X_raw)
    if hasattr(X_trans, "toarray"):
        X_trans = X_trans.toarray()

    # Get raw anomaly scores
    scores = model.decision_function(X_trans)

    # Tune threshold using precision-recall curve on inverted scores
    precision, recall, thresholds = precision_recall_curve((y_true == -1).astype(int), -scores)
    best_idx = np.argmax(recall)
    best_threshold = thresholds[best_idx] if recall[best_idx] > 0 else 0.0

    print("\n=== Threshold tuning results (Recall-focused) ===")
    print(f"Best threshold: {-best_threshold:.4f}")
    print(f"Precision at best: {precision[best_idx]:.4f}")
    print(f"Recall at best   : {recall[best_idx]:.4f}")
    print(f"F1-score at best : {2 * (precision[best_idx] * recall[best_idx]) / (precision[best_idx] + recall[best_idx] + 1e-6):.4f}")
    # Apply tuned threshold to get predicted labels
    y_pred = np.where(scores < -best_threshold, -1, 1)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[1, -1]).ravel()
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
    mcc = matthews_corrcoef(y_true, y_pred)
    roc_auc = roc_auc_score(y_true, -scores)
    pr_auc = average_precision_score(y_true, -scores)

    print("\n=== Extended Anomaly Detection Metrics ===")
    print(f"False Positive Rate (FPR): {fpr:.4f}")
    print(f"Matthews Correlation Coefficient (MCC): {mcc:.4f}")
    print(f"ROC-AUC: {roc_auc:.4f}")
    print(f"PR-AUC: {pr_auc:.4f}")
    
    return y_true, y_pred, scores, 
def main():
    try:
        print("[*] Loading trained model and preprocessor...")
        model = joblib.load(MODEL_PATH)
        preprocessor = joblib.load(PREPROCESSOR_PATH)
        print("[+] Artifacts loaded successfully.")

        df = load_data(TEST_FILE)
        y_true, y_pred, scores = evaluate_model(model, preprocessor, df)

        print("\n[+] Confusion Matrix:")
        print(confusion_matrix(y_true, y_pred))

        print("\n[+] Classification Report:")
        print(classification_report(y_true, y_pred, zero_division=0))

        # Save detailed results
        df_results = df.copy()
        df_results["anomaly_score"] = scores
        df_results["predicted_label"] = y_pred
        df_results.to_csv(RESULTS_FILE, index=False)
        print(f"\n[+] Detailed results saved to {RESULTS_FILE}")

    except FileNotFoundError as e:
        print(f"[!] Error: {e}")
    except Exception as e:
        print(f"[!] An unexpected error occurred: {e}")
        raise

if __name__ == "__main__":
    main()