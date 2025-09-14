import pandas as pd
import joblib
import os
from sklearn.cluster import DBSCAN
import numpy as np
from typing import Tuple

# --- Paths ---
BASE_DIR = os.path.dirname(__file__)
INPUT_FILE = os.path.join(BASE_DIR, "opensearch_dense.csv")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "preprocessor.pkl")
MODEL_FILE = os.path.join(BASE_DIR, "dbscan_model.pkl")

# --- Functions ---
def load_data(file_path):
    """Loads a CSV file into a pandas DataFrame."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    print(f"[*] Loading data from '{file_path}'...")
    df = pd.read_csv(file_path, low_memory=False)
    print(f"[*] Data loaded successfully: {df.shape[0]} rows, {df.shape[1]} columns")
    return df

def select_and_prepare_features(df):
    """
    Replicates the feature selection and preparation from process_logs.py
    to ensure consistency before passing to the preprocessor.
    """
    categorical = [
        'agent.name', 'agent.ip', 'data.alert_type', 'data.app', 'data.arch',
        'data.vulnerability.severity',
        'data.win.system.channel', 'data.win.system.providerName', 'data.win.system.opcode',
        'data.win.eventdata.processName', 'data.win.eventdata.exeFileName',
        'data.win.eventdata.user', 'data.win.eventdata.targetUserName'
    ]

    numeric = [
        'data.sca.failed', 'data.sca.passed', 'data.sca.score', 'data.sca.total_checks',
        'data.vulnerability.cvss.cvss2.base_score', 'data.vulnerability.cvss.cvss3.base_score',
        'data.win.system.eventID', 'data.win.system.eventRecordID',
        'data.win.system.level', 'data.win.system.severityValue',
        'data.win.system.processID', 'data.win.system.threadID',
        'data.winCounter.CookedValue', 'data.winCounter.RawValue'
    ]

    # Re-create timestamps if 'data.timestamp' is present
    if 'data.timestamp' in df.columns:
        df['data.timestamp'] = pd.to_datetime(df['data.timestamp'], errors='coerce')
        df['hour'] = df['data.timestamp'].dt.hour
        df['day_of_week'] = df['data.timestamp'].dt.day_name()
        categorical.append('day_of_week')
        numeric.append('hour')

    # Ensure only selected columns are used and converted to the correct type
    df_prepared = df[[col for col in categorical + numeric if col in df.columns]].copy()
    
    for col in numeric:
        if col in df_prepared.columns:
            df_prepared[col] = pd.to_numeric(df_prepared[col], errors='coerce')
    
    for col in categorical:
        if col in df_prepared.columns:
            df_prepared[col] = df_prepared[col].astype(str).fillna("missing")
            
    return df_prepared

def train_dbscan(df, preprocessor):
    """Trains a DBSCAN model on preprocessed data."""
    print("[*] Replicating feature engineering steps...")
    X_filled = select_and_prepare_features(df)
    
    print("[*] Transforming data with preprocessor...")
    X_processed = preprocessor.transform(X_filled)
    
    # Check if the output is a sparse matrix, and convert if necessary
    if hasattr(X_processed, "toarray"):
        X_processed = X_processed.toarray()

    print("[*] Training DBSCAN model...")
    model = DBSCAN(eps=0.5, min_samples=5, n_jobs=-1)
    
    model.fit(X_processed)
    labels = model.labels_

    print("[+] DBSCAN model training completed.")
    return model, labels, X_processed

def report_results(labels):
    """Prints a summary of the DBSCAN clustering results."""
    n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
    n_noise_ = list(labels).count(-1)

    print("\n=== DBSCAN Results ===")
    print(f"Number of clusters found: {n_clusters_}")
    print(f"Number of anomalies (noise points): {n_noise_}")
    print(f"Anomaly rate: {n_noise_ / len(labels) * 100:.2f}%")

def save_results(df, labels):
    """Saves the original data with DBSCAN labels."""
    df_results = df.copy()
    df_results['dbscan_label'] = labels
    out_file = os.path.join(BASE_DIR, "dbscan_results.csv")
    df_results.to_csv(out_file, index=False)
    print(f"\n[+] DBSCAN results saved to '{out_file}'")

def main():
    try:
        df = load_data(INPUT_FILE)
        print("[*] Loading preprocessor...")
        preprocessor = joblib.load(PREPROCESSOR_PATH)
        print("[+] Preprocessor loaded successfully.")

        model, labels, X_processed = train_dbscan(df, preprocessor)
        
        report_results(labels)
        save_results(df, labels)
        joblib.dump(model, MODEL_FILE)
        print(f"[+] DBSCAN model saved to '{MODEL_FILE}'")

    except FileNotFoundError as e:
        print(f"[!] Error: {e}")
        print("[!] Please ensure the input data and preprocessor files exist.")
    except Exception as e:
        print(f"[!] An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()