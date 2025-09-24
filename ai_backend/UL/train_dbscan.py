"""
Train DBSCAN on processed logs using schema and preprocessor
"""

import pandas as pd
import joblib
import os
from sklearn.cluster import DBSCAN
import json
import numpy as np

# --- Paths ---
BASE_DIR = os.path.dirname(__file__)
INPUT_FILE = os.path.join(BASE_DIR, "processed_logs.csv")  # Already processed logs
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "preprocessor.pkl")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.json")
MODEL_FILE = os.path.join(BASE_DIR, "dbscan_model.pkl")

# --- Functions ---
def load_schema_and_preprocessor():
    print("[*] Loading preprocessor and schema...")
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    with open(SCHEMA_PATH, "r") as f:
        schema = json.load(f)
    print("[+] Preprocessor and schema loaded")
    return preprocessor, schema

def load_data():
    print(f"[*] Loading processed data from {INPUT_FILE}...")
    df = pd.read_csv(INPUT_FILE, low_memory=False)
    print(f"[+] Loaded {df.shape[0]} rows, {df.shape[1]} columns")
    return df

def ensure_schema_columns(df: pd.DataFrame, schema: dict) -> pd.DataFrame:
    """Ensure the dataframe has all columns defined in the schema."""
    all_columns = schema.get("categorical", []) + schema.get("numeric", [])
    missing_cols = set(all_columns) - set(df.columns)
    
    for col in missing_cols:
        if col in schema.get("numeric", []):
            df[col] = 0.0
        else:
            df[col] = "missing"
    
    return df[all_columns]

def train_dbscan(X_processed, eps=0.1, min_samples=6):
    print("[*] Training DBSCAN model...")
    model = DBSCAN(eps=eps, min_samples=min_samples, n_jobs=-1)
    model.fit(X_processed)
    
    n_clusters = len(set(model.labels_)) - (1 if -1 in model.labels_ else 0)
    n_noise = list(model.labels_).count(-1)
    print(f"[+] DBSCAN trained: {n_clusters} clusters, {n_noise} noise points")
    
    return model

def main():
    try:
        # Load artifacts
        preprocessor, schema = load_schema_and_preprocessor()
        df = load_data()

        # Ensure schema consistency
        df = ensure_schema_columns(df, schema)

        # Transform features
        print("[*] Transforming data with preprocessor...")
        X_processed = preprocessor.transform(df)
        if hasattr(X_processed, "toarray"):
            X_processed = X_processed.toarray()
        print(f"[+] Preprocessed data shape: {X_processed.shape}")

        # Train DBSCAN
        model = train_dbscan(X_processed)

        # Save trained model
        joblib.dump(model, MODEL_FILE)
        print(f"[+] DBSCAN model saved to '{MODEL_FILE}'")

    except Exception as e:
        print(f"[!] An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()