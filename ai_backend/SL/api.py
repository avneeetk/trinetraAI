# trinetra-ai-backend/api.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import joblib
import pandas as pd
import os
import uvicorn
import traceback

app = FastAPI(
    title="Trinetra Cyber Range AI Backend",
    description="A simple API to demonstrate AI-powered threat risk scoring."
)

origins = [
    "http://localhost:8080",  
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)


# Global variable for model
model_pipeline = None
model_path = 'random_forest_model.pkl'

def load_model():
    """Loads the trained model from disk."""
    global model_pipeline
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model file '{model_path}' not found. Please run train_model.py first"
        )
    
    print(f"[*] Loading model from '{model_path}'...")
    model_pipeline = joblib.load(model_path)
    print("[+] Model loaded successfully")

# Pydantic model
class AlertInput(BaseModel):
    alert_type_description: str
    severity: int
    src_ip: str
    username: str
    dest_ip: str = "N/A"
    process: str = "N/A"
    file_name: str = "N/A"
    port: str = "N/A"     # kept as string to match training
    logon_hour: int
    day_of_week: str
    agent_os: str

    class Config:
        schema_extra = {
            "example": {
                "alert_type_description": "Multiple failed SSH login attempts",
                "severity": 7,
                "src_ip": "1.2.3.4",
                "username": "admin",
                "dest_ip": "N/A",
                "process": "N/A",
                "file_name": "N/A",
                "port": "22",
                "logon_hour": 10,
                "day_of_week": "Monday",
                "agent_os": "Windows"
            }
        }

@app.on_event("startup")
async def startup_event():
    """Loads model when the server starts."""
    load_model()

@app.post("/predict_risk/")
async def predict_risk(alerts: List[AlertInput]):
    """
    Batch prediction: Accepts a list of alerts and returns risk scores.
    """
    if model_pipeline is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Server startup failed.")

    try:
        # Convert input to DataFrame
        input_data = [alert.dict() for alert in alerts]
        input_df = pd.DataFrame(input_data)

        # Ensure consistent dtypes
        categorical_features = [
            "alert_type_description", "src_ip", "username",
            "dest_ip", "process", "file_name", "agent_os",
            "day_of_week", "port"
        ]
        numerical_features = ["severity", "logon_hour"]

        for col in categorical_features:
            input_df[col] = input_df[col].astype(str).fillna("missing")

        for col in numerical_features:
            input_df[col] = pd.to_numeric(input_df[col], errors="coerce")

        # Predict
        predictions = model_pipeline.predict(input_df)
        confidence_scores = model_pipeline.predict_proba(input_df)[:, 1]

        # Build response
        results = []
        for i, alert in enumerate(alerts):
            results.append({
                "alert_type_description": alert.alert_type_description,
                "is_high_risk": bool(predictions[i]),
                "risk_score": round(confidence_scores[i] * 100, 2),
                "details": "Prediction made by the AI Risk Scoring Engine"
            })

        return results

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

@app.post("/predict_single/")
async def predict_single(alert: AlertInput):
    """
    Single prediction: Accepts one alert and returns a risk score.
    """
    result = await predict_risk([alert])
    return result[0]

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)