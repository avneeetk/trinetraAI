import pandas as pd
import joblib
import os
from sklearn.cluster import DBSCAN
from sklearn.metrics import (
    confusion_matrix,
    classification_report
)
from typing import Tuple

# --- Paths ---
BASE_DIR = os.path.dirname(__file__)
MODEL_FILE = os.path.join(BASE_DIR, "dbscan_model.pkl")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "preprocessor.pkl")
TEST_FILE = os.path.join(BASE_DIR, "synthetic_testset.csv") # Replace with your labeled test set

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

    if 'data.timestamp' in df.columns:
        df['data.timestamp'] = pd.to_datetime(df['data.timestamp'], errors='coerce')
        df['hour'] = df['data.timestamp'].dt.hour
        df['day_of_week'] = df['data.timestamp'].dt.day_name()
        categorical.append('day_of_week')
        numeric.append('hour')

    df_prepared = df[[col for col in categorical + numeric if col in df.columns]].copy()
    
    for col in numeric:
        if col in df_prepared.columns:
            df_prepared[col] = pd.to_numeric(df_prepared[col], errors='coerce')
    
    for col in categorical:
        if col in df_prepared.columns:
            df_prepared[col] = df_prepared[col].astype(str).fillna("missing")
            
    return df_prepared


def evaluate_dbscan():
    """Main evaluation function."""
    try:
        # Load artifacts
        print("[*] Loading trained model and preprocessor...")
        model = joblib.load(MODEL_FILE)
        preprocessor = joblib.load(PREPROCESSOR_PATH)
        print("[+] Artifacts loaded successfully.")

        # Load data
        df = load_data(TEST_FILE)

        # Split into features + labels
        if "label" not in df.columns:
            raise ValueError("Test set must contain a 'label' column with ground truth (1=normal, -1=anomaly)")
        
        X_raw = df.drop(columns=["label"])
        y_true = df["label"].values

        # Prepare features for the preprocessor
        X_prepared = select_and_prepare_features(X_raw)
        
        print("[*] Transforming data with preprocessor...")
        X_processed = preprocessor.transform(X_prepared)
        if hasattr(X_processed, "toarray"):
            X_processed = X_processed.toarray()

        print("[*] Predicting labels on test set...")
        # DBSCAN does not have a simple 'predict' method. We must re-run 'fit_predict'.
        y_pred = model.fit_predict(X_processed)
        
        # Convert all positive cluster labels to 'normal' (1)
        y_pred[y_pred != -1] = 1
        
        # Evaluation metrics
        print("\n[+] Confusion Matrix:")
        print(confusion_matrix(y_true, y_pred))

        print("\n[+] Classification Report:")
        print(classification_report(y_true, y_pred, zero_division=0))

    except FileNotFoundError as e:
        print(f"[!] Error: {e}")
        print("[!] Please ensure the model, preprocessor, and test data files exist in the same directory.")
    except Exception as e:
        print(f"[!] An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    evaluate_dbscan()