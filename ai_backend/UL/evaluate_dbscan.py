import pandas as pd
import joblib
import os
from sklearn.cluster import DBSCAN
from sklearn.metrics import confusion_matrix, classification_report, roc_auc_score, average_precision_score
import numpy as np
import json

# --- Paths ---
BASE_DIR = os.path.dirname(__file__)
MODEL_FILE = os.path.join(BASE_DIR, "dbscan_model.pkl")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "preprocessor.pkl")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.json")
TEST_FILE = os.path.join(BASE_DIR, "synthetic_testset.csv")  # Replace with your labeled test set
RESULTS_FILE = os.path.join(BASE_DIR, "dbscan_results_evaluation.csv")

def load_data(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    df = pd.read_csv(file_path, low_memory=False)
    print(f"[+] Test set loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    return df

def prepare_features(df, schema):
    """Prepare features according to the schema, handling missing columns."""
    expected_cols = schema["categorical"] + schema["numeric"]
    # Add missing columns with default values
    for col in expected_cols:
        if col not in df.columns:
            if col in schema["numeric"]:
                df[col] = 0
            else:
                df[col] = "missing"

    # Select only expected columns in the correct order
    df = df[expected_cols].copy()

    # Coerce numeric columns
    for col in schema["numeric"]:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Ensure categorical columns are string
    for col in schema["categorical"]:
        df[col] = df[col].astype(str).fillna("missing")

    return df

from sklearn.metrics import silhouette_score

def evaluate_dbscan():
    try:
        # Load artifacts
        print("[*] Loading model, preprocessor, and schema...")
        model = joblib.load(MODEL_FILE)
        preprocessor = joblib.load(PREPROCESSOR_PATH)
        with open(SCHEMA_PATH, "r") as f:
            schema = json.load(f)
        print("[+] Artifacts loaded successfully.")

        # Load test data
        df = load_data(TEST_FILE)
        if "label" not in df.columns:
            raise ValueError("Test set must contain a 'label' column (1=normal, -1=anomaly)")

        y_true = df["label"].values
        X_raw = df.drop(columns=["label"])
        X_prepared = prepare_features(X_raw, schema)

        print("[*] Transforming data with preprocessor...")
        X_processed = preprocessor.transform(X_prepared)
        if hasattr(X_processed, "toarray"):
            X_processed = X_processed.toarray()

        print("[*] Predicting labels with DBSCAN...")
        y_pred_clusters = model.fit_predict(X_processed)
        y_pred = np.where(y_pred_clusters == -1, -1, 1)

        print("\n[+] Confusion Matrix:")
        print(confusion_matrix(y_true, y_pred))

        print("\n[+] Classification Report:")
        print(classification_report(y_true, y_pred, zero_division=0))

        # Anomaly scores (proxy)
        scores = np.where(y_pred == -1, -1.0, 1.0)
        roc_auc = roc_auc_score((y_true == -1).astype(int), -scores)
        pr_auc = average_precision_score((y_true == -1).astype(int), -scores)

        # Silhouette score (only for clustered points)
        clustered_mask = y_pred_clusters >= 0
        if clustered_mask.sum() > 1:
            sil_score = silhouette_score(X_processed[clustered_mask], y_pred_clusters[clustered_mask])
            print(f"[+] Silhouette Score (clusters only): {sil_score:.4f}")
        else:
            sil_score = np.nan
            print("[!] Not enough clustered points to compute silhouette score.")

        print("=== Evaluation metrics ===")
        print(f"ROC-AUC : {roc_auc:.4f}")
        print(f"PR-AUC  : {pr_auc:.4f}")

        # Save detailed results
        df_results = df.copy()
        df_results["predicted_label"] = y_pred
        df_results["anomaly_score"] = scores
        df_results.to_csv(RESULTS_FILE, index=False)
        print(f"[+] Detailed results saved to {RESULTS_FILE}")

    except Exception as e:
        print(f"[!] An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    evaluate_dbscan()