"""
Generate a synthetic test dataset with pseudo labels for evaluating anomaly detection.
"""

import pandas as pd
import numpy as np
import os

RAW_FILE = os.path.join(os.path.dirname(__file__), "opensearch_reduced.csv")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "synthetic_testset.csv")

def load_and_sample(n=100):
    if not os.path.exists(RAW_FILE):
        raise FileNotFoundError(f"File not found: {RAW_FILE}")

    print(f"[*] Loading raw data from {RAW_FILE}...")
    df = pd.read_csv(RAW_FILE, low_memory=False)

    # Random sample
    df = df.sample(n=min(n, len(df)), random_state=42).reset_index(drop=True)
    print(f"[+] Sampled {df.shape[0]} rows, {df.shape[1]} columns")
    return df

def add_time_features(df):
    """Ensure hour and day_of_week exist (needed by preprocessor)."""
    if "data.timestamp" in df.columns:
        df["data.timestamp"] = pd.to_datetime(df["data.timestamp"], errors="coerce")
        df["hour"] = df["data.timestamp"].dt.hour.fillna(0).astype(int)
        df["day_of_week"] = df["data.timestamp"].dt.day_name().fillna("Monday")
    else:
        # fallback if no timestamp present
        df["hour"] = np.random.randint(0, 24, size=len(df))
        df["day_of_week"] = np.random.choice(
            ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            size=len(df)
        )
    return df

def add_synthetic_labels(df, frac_anom: float = 0.05):
    """
    Add pseudo ground-truth labels using the IsolationForest convention:
        1  -> normal
       -1  -> anomaly

    Parameters
    ----------
    df : pd.DataFrame
        Input dataframe.
    frac_anom : float, default 0.05
        Fraction of rows to tag as anomalies.
    """
    # Start all as normal (1)
    df["label"] = 1

    # Inject anomalies randomly
    n_anomalies = max(1, int(frac_anom * len(df)))
    anomaly_idx = np.random.choice(df.index, size=n_anomalies, replace=False)
    df.loc[anomaly_idx, "label"] = -1

    print(f"[+] Injected {n_anomalies} anomalies into dataset (label = -1)")
    return df

def main():
    df = load_and_sample()
    df = add_time_features(df)
    df = add_synthetic_labels(df)

    df.to_csv(OUTPUT_FILE, index=False)
    print(f"[+] Saved synthetic testset to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()