import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
from sklearn.ensemble import IsolationForest
import traceback

app = FastAPI(title="Trinetra Anomaly Detector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "isolation_forest.pkl"
PREPROCESSOR_PATH = "preprocessor.pkl"

trained_model: IsolationForest = None
preprocessor = joblib.load(PREPROCESSOR_PATH)

# Pydantic input model
class LogEntry(BaseModel):
    agent_name: str
    agent_ip: str
    data_alert_type: str
    hour: int
    day_of_week: str
    sca_score: float
    sca_total_checks: int
    win_system_eventID: int

# Map frontend keys to preprocessor columns
def map_logs_for_preprocessor(df: pd.DataFrame) -> pd.DataFrame:
    mapping = {
        "agent_name": "agent.name",
        "agent_ip": "agent.ip",
        "data_alert_type": "data.alert_type",
        "hour": "hour",
        "day_of_week": "day_of_week",
        "sca_score": "data.sca.score",
        "sca_total_checks": "data.sca.total_checks",
        "win_system_eventID": "data.win.system.eventID"
    }

    for old, new in mapping.items():
        if old in df.columns:
            df[new] = df[old]

    required_columns = [
        'agent.name', 'agent.ip', 'data.alert_type', 'data.win.system.channel',
        'data.win.system.providerName', 'data.win.eventdata.processName',
        'data.win.eventdata.user', 'data.win.eventdata.ruleName',
        'data.win.system.severityValue', 'data.sca.score',
        'data.sca.total_checks', 'data.vulnerability.cvss.cvss3.base_score',
        'data.win.system.eventID', 'hour', 'day_of_week'
    ]

    for col in required_columns:
        if col not in df.columns:
            df[col] = 0 if "score" in col or "Value" in col or "ID" in col else "missing"

    return df[required_columns]

@app.post("/train_anomaly/")
def train_anomaly(logs: List[LogEntry]):
    global trained_model, preprocessor
    try:
        df = pd.DataFrame([log.dict() for log in logs])
        df_mapped = map_logs_for_preprocessor(df)
        X = preprocessor.transform(df_mapped)
        if hasattr(X, "toarray"):
            X = X.toarray()
        
        trained_model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42, n_jobs=-1)
        trained_model.fit(X)
        joblib.dump(trained_model, MODEL_PATH)

        labels = trained_model.predict(X)
        n_anomalies = (labels == -1).sum()
        return {"status": "success", "trained": True, "training_anomalies": int(n_anomalies)}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Training failed: {e}")

@app.post("/predict_anomaly/")
def predict_anomaly(logs: List[LogEntry]):
    global trained_model, preprocessor
    if trained_model is None:
        try:
            trained_model = joblib.load(MODEL_PATH)
        except Exception:
            raise HTTPException(status_code=400, detail="Model not trained yet. Call /train_anomaly/ first.")
    try:
        df = pd.DataFrame([log.dict() for log in logs])
        df_mapped = map_logs_for_preprocessor(df)
        X = preprocessor.transform(df_mapped)
        if hasattr(X, "toarray"):
            X = X.toarray()
        scores = trained_model.decision_function(X)
        labels = trained_model.predict(X)
        return [{"log_index": i, "anomaly_score": float(scores[i]), "anomaly_label": int(labels[i])} for i in range(len(df))]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_ul:app", host="0.0.0.0", port=8001, reload=True)