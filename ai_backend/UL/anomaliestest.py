import pandas as pd

# Load anomalies
anomalies = pd.read_csv("ai_backend/UL/anomalies.csv")

print(f"[+] Loaded anomalies: {anomalies.shape[0]} rows, {anomalies.shape[1]} columns")

# Preview
print(anomalies.head())

# Count of anomaly labels
print(anomalies["anomaly_label"].value_counts())

# Top anomalies (lowest score = most anomalous)
print(anomalies.sort_values("anomaly_score").head(20))

# Example: check suspicious IPs or users
if "agent.ip" in anomalies.columns:
    print("\nTop anomalous IPs:")
    print(anomalies.groupby("agent.ip")["anomaly_label"].count().sort_values(ascending=False).head(10))

if "data.win.eventdata.user" in anomalies.columns:
    print("\nTop anomalous users:")
    print(anomalies.groupby("data.win.eventdata.user")["anomaly_label"].count().sort_values(ascending=False).head(10))