import pandas as pd
import joblib
import os
from sklearn.svm import OneClassSVM
import numpy as np

# --- Paths ---
BASE_DIR = os.path.dirname(__file__)
RAW_FILE = os.path.join(BASE_DIR, "opensearch_reduced.csv")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "preprocessor.pkl")
MODEL_FILE = os.path.join(BASE_DIR, "one_class_svm.pkl")

# --- Functions ---
def load_data(file_path):
    """Loads raw data from a CSV file."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    print(f"[*] Loading raw data from {file_path}...")
    df = pd.read_csv(file_path, low_memory=False)
    print(f"[+] Loaded {df.shape[0]} rows, {df.shape[1]} columns")
    return df


def train_model():
    """Trains a One-Class SVM model on preprocessed data."""
    try:
        # Load cleaned data
        df = load_data(RAW_FILE)

        # Load preprocessor (fitted in process_logs.py)
        print("[*] Loading preprocessor...")
        preprocessor = joblib.load(PREPROCESSOR_PATH)
        print("[+] Preprocessor loaded successfully.")

        # Ensure feature consistency
        expected_features = list(preprocessor.feature_names_in_)
        print(f"[*] Ensuring consistency with {len(expected_features)} features...")

        # Reindex DataFrame to match preprocessor input
        df_prepared = df.reindex(columns=expected_features, fill_value=np.nan)

        # Transform data
        print("[*] Transforming data with preprocessor...")
        X_processed = preprocessor.transform(df_prepared)

        # Convert sparse to dense if needed
        if hasattr(X_processed, "toarray"):
            X_processed = X_processed.toarray()

        # Train One-Class SVM
        print("[*] Training One-Class SVM...")
        model = OneClassSVM(
            kernel="rbf",   # Radial basis function kernel
            gamma="auto",   # Scale automatically
            nu=0.05          # Expected proportion of anomalies (tunable!)
        )
        model.fit(X_processed)
        print("[+] Model training completed.")

        # Save model
        joblib.dump(model, MODEL_FILE)
        print(f"[+] Model saved to {MODEL_FILE}")

    except FileNotFoundError as e:
        print(f"[!] Error: {e}")
        print("[!] Please ensure the raw data and preprocessor files exist.")
    except Exception as e:
        print(f"[!] An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    train_model()