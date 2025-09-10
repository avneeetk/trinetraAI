"""
Train anomaly detection model (Isolation Forest) on processed logs
"""

import pandas as pd
import joblib
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest
import os

INPUT_FILE = os.path.join(os.path.dirname(__file__), "processed_logs.csv")
MODEL_FILE = os.path.join(os.path.dirname(__file__), "isolation_forest.pkl")

def load_data():
    print(f"[*] Loading processed data from {INPUT_FILE}...")
    df = pd.read_csv(INPUT_FILE, low_memory=False)
    print(f"[+] Loaded {df.shape[0]} rows, {df.shape[1]} features")
    return df

def train_model(df):
    print("[*] Training Isolation Forest...")
    model = IsolationForest(
        n_estimators=100,
        contamination=0.02,  # assume ~1% anomalies
        random_state=42,
        n_jobs=-1
    )
    model.fit(df)
    print("[+] Model training completed")
    return model

def save_model(model):
    joblib.dump(model, MODEL_FILE)
    print(f"[+] Model saved to {MODEL_FILE}")

def plot_scores(scores):
    # Plot histogram of anomaly scores
    plt.hist(scores, bins=50, color="skyblue", edgecolor="black")
    plt.title("Distribution of Anomaly Scores")
    plt.xlabel("Anomaly Score")
    plt.ylabel("Frequency")
    out_file = os.path.join(os.path.dirname(__file__), "anomaly_score_distribution.png")
    plt.savefig(out_file)
    print(f"[+] Histogram saved to {out_file}")
    plt.close()

def save_anomalies(df, predictions, scores):
    anomalies = df.copy()
    anomalies["anomaly_score"] = scores
    anomalies["anomaly_label"] = predictions 

    anomalies_only = anomalies[anomalies["anomaly_label"] == -1]
    anomalies_only.to_csv("anomalies.csv", index=False)

    print(f"[+] Anomalies saved to 'anomalies.csv' ({len(anomalies_only)} rows)")

def plot_scatter(scores, predictions):
    plt.figure(figsize=(12,6))
    plt.scatter(range(len(scores)), scores, 
                c=["red" if p == -1 else "blue" for p in predictions], 
                alpha=0.6)
    plt.title("Anomaly Scores Scatter Plot")
    plt.xlabel("Log Index")
    plt.ylabel("Anomaly Score")
    plt.grid(True)
    plt.savefig("scatter_anomaly_scores.png")
    print("[+] Saved scatter plot as 'scatter_anomaly_scores.png'")
    plt.close()

def main():
    df = load_data()
    model = train_model(df)
    save_model(model)

    print("[*] Scoring anomalies...")
    anomaly_scores = model.decision_function(df)
    predictions = model.predict(df)
    print("[+] Anomaly scores computed")
    print(f"{(predictions == -1).sum()}/{len(predictions)} anomalies detected")

    save_anomalies(df, predictions, anomaly_scores)
    plot_scores(anomaly_scores)
    plot_scatter(anomaly_scores, predictions)


if __name__ == "__main__":
    main()