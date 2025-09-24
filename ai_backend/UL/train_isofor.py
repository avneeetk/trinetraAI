"""
Train anomaly detection model (Isolation Forest) on processed logs
"""

import pandas as pd
import joblib
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest
import os
import json

# --- Paths ---
BASE_DIR = os.path.dirname(__file__)
INPUT_FILE = os.path.join(BASE_DIR, "processed_logs.csv")
MODEL_FILE = os.path.join(BASE_DIR, "isolation_forest.pkl")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "preprocessor.pkl")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.json")


def load_and_preprocess():
    print(f"[*] Loading raw data from {INPUT_FILE}...")
    df = pd.read_csv(INPUT_FILE, low_memory=False)
    print(f"[+] Loaded {df.shape[0]} rows, {df.shape[1]} columns")

    # Load preprocessor + schema
    print("[*] Loading preprocessor and schema...")
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    with open(SCHEMA_PATH, "r") as f:
        schema = json.load(f)

    # Ensure we keep only schema-defined features
    features = schema["categorical"] + schema["numeric"]
    df = df[[col for col in features if col in df.columns]].copy()

    # Apply preprocessing
    print("[*] Applying preprocessing...")
    X = preprocessor.transform(df)
    if hasattr(X, "toarray"):  # handle sparse matrices
        X = X.toarray()
    print(f"[+] Preprocessed data shape: {X.shape}")

    return df, X


def train_model(X):
    print("[*] Training Isolation Forest...")
    model = IsolationForest(
        n_estimators=100,
        contamination=0.01,  
        random_state=20,
        n_jobs=-1
    )
    model.fit(X)
    print("[+] Model training completed")
    return model


def save_model(model):
    joblib.dump(model, MODEL_FILE)
    print(f"[+] Model saved to {MODEL_FILE}")


def plot_scores(scores):
    plt.hist(scores, bins=50, color="skyblue", edgecolor="black")
    plt.title("Distribution of Anomaly Scores")
    plt.xlabel("Anomaly Score")
    plt.ylabel("Frequency")
    out_file = os.path.join(BASE_DIR, "anomaly_score_distribution.png")
    plt.savefig(out_file)
    print(f"[+] Histogram saved to '{out_file}'")
    plt.close()


def save_anomalies(df, predictions, scores):
    anomalies = df.copy()
    anomalies["anomaly_score"] = scores
    anomalies["anomaly_label"] = predictions
    anomalies_only = anomalies[anomalies["anomaly_label"] == -1]
    out_csv = os.path.join(BASE_DIR, "anomalies.csv")
    anomalies_only.to_csv(out_csv, index=False)
    print(f"[+] Anomalies saved to '{out_csv}' ({len(anomalies_only)} rows)")


def plot_scatter(scores, predictions):
    plt.figure(figsize=(12, 6))
    plt.scatter(
        range(len(scores)), scores,
        c=["red" if p == -1 else "blue" for p in predictions],
        alpha=0.6
    )
    plt.title("Anomaly Scores Scatter Plot")
    plt.xlabel("Log Index")
    plt.ylabel("Anomaly Score")
    plt.grid(True)
    out_file = os.path.join(BASE_DIR, "scatter_anomaly_scores.png")
    plt.savefig(out_file)
    print(f"[+] Saved scatter plot as '{out_file}'")
    plt.close()


def main():
    df, X = load_and_preprocess()
    model = train_model(X)
    save_model(model)

    print("[*] Scoring anomalies...")
    anomaly_scores = model.decision_function(X)
    predictions = model.predict(X)
    print("[+] Anomaly scores computed")
    print(f"{(predictions == -1).sum()}/{len(predictions)} anomalies detected")

    save_anomalies(df, predictions, anomaly_scores)
    plot_scores(anomaly_scores)
    plot_scatter(anomaly_scores, predictions)


if __name__ == "__main__":
    main()