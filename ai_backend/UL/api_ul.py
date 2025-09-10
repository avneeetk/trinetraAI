from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import pandas as pd
import joblib
import os

app = FastAPI(
    title="Unsupervised Log Anomaly Detection API",
    description="Isolation Forest + Preprocessor for anomaly detection on security logs."
)

# ===============================
# Paths
# ===============================
BASE_DIR = os.path.dirname(__file__)
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "preprocessor.pkl")
MODEL_PATH = os.path.join(BASE_DIR, "isolation_forest.pkl")

# Globals
preprocessor = None
model = None

# ===============================
# Load model and preprocessor
# ===============================
@app.on_event("startup")
def load_artifacts():
    global preprocessor, model
    if not os.path.exists(PREPROCESSOR_PATH) or not os.path.exists(MODEL_PATH):
        raise RuntimeError("Preprocessor or model file missing. Train the model first.")
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    model = joblib.load(MODEL_PATH)
    print("[+] Preprocessor and Model loaded successfully.")

# ===============================
# Input schema with training column names (via alias)
# ===============================
class LogInput(BaseModel):
    agent_name: Optional[str] = Field("unknown", alias="agent.name")
    agent_ip: Optional[str] = Field("0.0.0.0", alias="agent.ip")
    data_alert_type: Optional[str] = Field("unknown", alias="data.alert_type")
    data_app: Optional[str] = Field("unknown", alias="data.app")
    data_arch: Optional[str] = Field("unknown", alias="data.arch")
    data_vulnerability_severity: Optional[str] = Field("low", alias="data.vulnerability.severity")
    data_win_system_channel: Optional[str] = Field("unknown", alias="data.win.system.channel")
    data_win_system_providerName: Optional[str] = Field("unknown", alias="data.win.system.providerName")
    data_win_system_opcode: Optional[str] = Field("unknown", alias="data.win.system.opcode")
    data_win_eventdata_processName: Optional[str] = Field("unknown", alias="data.win.eventdata.processName")
    data_win_eventdata_exeFileName: Optional[str] = Field("unknown", alias="data.win.eventdata.exeFileName")
    data_win_eventdata_user: Optional[str] = Field("unknown", alias="data.win.eventdata.user")
    data_win_eventdata_targetUserName: Optional[str] = Field("unknown", alias="data.win.eventdata.targetUserName")

    data_sca_failed: Optional[float] = Field(0.0, alias="data.sca.failed")
    data_sca_passed: Optional[float] = Field(0.0, alias="data.sca.passed")
    data_sca_score: Optional[float] = Field(0.0, alias="data.sca.score")
    data_sca_total_checks: Optional[float] = Field(0.0, alias="data.sca.total_checks")

    data_vulnerability_cvss_cvss2_base_score: Optional[float] = Field(0.0, alias="data.vulnerability.cvss.cvss2.base_score")
    data_vulnerability_cvss_cvss3_base_score: Optional[float] = Field(0.0, alias="data.vulnerability.cvss.cvss3.base_score")

    data_win_system_eventID: Optional[float] = Field(0.0, alias="data.win.system.eventID")
    data_win_system_eventRecordID: Optional[float] = Field(0.0, alias="data.win.system.eventRecordID")
    data_win_system_level: Optional[float] = Field(0.0, alias="data.win.system.level")
    data_win_system_severityValue: Optional[float] = Field(0.0, alias="data.win.system.severityValue")
    data_win_system_processID: Optional[float] = Field(0.0, alias="data.win.system.processID")
    data_win_system_threadID: Optional[float] = Field(0.0, alias="data.win.system.threadID")

    data_winCounter_CookedValue: Optional[float] = Field(0.0, alias="data.winCounter.CookedValue")
    data_winCounter_RawValue: Optional[float] = Field(0.0, alias="data.winCounter.RawValue")

    hour: Optional[int] = 0
    day_of_week: Optional[str] = "Monday"

    class Config:
        allow_population_by_field_name = True   # lets you send either alias or field_name


# ===============================
# Prediction helper
# ===============================
def predict(df: pd.DataFrame):
    try:
        X = preprocessor.transform(df)
        scores = model.decision_function(X)
        labels = model.predict(X)
        return labels, scores
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# ===============================
# Routes
# ===============================
@app.post("/predict_single/")
def predict_single(log: LogInput):
    # Use dict(by_alias=True) so column names match training
    df = pd.DataFrame([log.dict(by_alias=True)])
    labels, scores = predict(df)
    return {
        "anomaly_label": int(labels[0]),
        "anomaly_score": float(scores[0]),
        "details": "Isolation Forest anomaly detection"
    }

@app.post("/predict_batch/")
def predict_batch(logs: List[LogInput]):
    df = pd.DataFrame([log.dict(by_alias=True) for log in logs])
    labels, scores = predict(df)
    results = []
    for i in range(len(df)):
        results.append({
            "anomaly_label": int(labels[i]),
            "anomaly_score": float(scores[i])
        })
    return {"results": results}