
Trinetra AI – Anomaly Detection Dashboard

This repository contains an anomaly detection system built with FastAPI as backend and React as frontend. It uses an Isolation Forest model to detect anomalies in Windows system logs. The UI allows viewing 7-day historical logs, training the model, and predicting anomalies for the 8th day.

⸻

Features
	•	Display 7-day historical log data in a structured table.
	•	Expand individual log entries for detailed information (process, user, severity, rule, etc.).
	•	Train an Isolation Forest model on historical logs.
	•	Predict anomalies for the 8th day using the trained model.
	•	Summarize total logs and detected anomalies.
	•	Supports mock logs for demo purposes.

⸻

Tech Stack
	•	Frontend: React, TypeScript, TailwindCSS, Lucide-react icons
	•	Backend: FastAPI, Python 3.13, Scikit-learn, Pandas, Joblib
	•	Machine Learning: Isolation Forest
	•	Data: Mock log data (src/data/logs.ts) with historical logs and 8th-day logs.

⸻

Project Structure

trinetraAI/
├─ ai_backend/
│  ├─ api_ul.py              # FastAPI backend API
│  ├─ preprocessor.pkl       # Saved preprocessor for ML features
│  ├─ isolation_forest.pkl   # Trained Isolation Forest model
│  ├─ preprocess_logs.py     # Preprocessing pipeline
│
├─ src/
│  ├─ components/
│  │  └─ AnomalyDetector.tsx # React component for UI
│  ├─ data/
│  │  └─ logs.ts             # Mock logs for 7+1 days
│  └─ ui/                    # Custom UI components
│
├─ package.json
└─ README.md


⸻

Setup Instructions

Backend (FastAPI)
	1.	Create a virtual environment:

python3 -m venv .venv
source .venv/bin/activate

	2.	Install dependencies:

pip install fastapi uvicorn scikit-learn pandas joblib

	3.	Run the backend API:

uvicorn ai_backend.api_ul:app --host 0.0.0.0 --port 8001 --reload

	•	Endpoints:
	•	POST /train_anomaly/ – Train Isolation Forest model using logs.
	•	POST /predict_anomaly/ – Predict anomalies for new logs.

⸻

Frontend (React)
	1.	Install dependencies:

cd src
npm install

	2.	Start the development server:

npm start

	•	Default port: 8080
	•	Connects to backend at http://localhost:8001

⸻

Usage
	1.	View 7-Day Logs:
	•	Expand rows to see detailed log information.
	2.	Train Model:
	•	Click Start Training to train the Isolation Forest on 7-day logs.
	•	Summary shows total anomalies detected in the training set.
	3.	Predict 8th Day Anomalies:
	•	Click Predict 8th Day to detect anomalies in the separate 8th-day logs.
	•	Logs table updates dynamically with prediction results.
	•	Summary updates with total anomalies detected.

⸻

Notes
	•	Ensure the backend is running before interacting with the frontend.
	•	Mock logs include 2 logs per day for 7 days and 5 logs for the 8th day.
	•	Expanded details in the UI include:
	•	Process Name
	•	User
	•	Rule Name
	•	Channel
	•	Severity
	•	Anomaly Score

⸻

Troubleshooting
	1.	CORS Errors:
	•	Ensure frontend (localhost:8080) is added to FastAPI origins in api_ul.py.
	2.	422 Unprocessable Content / Missing Columns:
	•	Confirm that the frontend payload matches the preprocessor schema (preprocessor.pkl).
	•	Required fields: agent_name, agent_ip, data_alert_type, hour, day_of_week, sca_score, sca_total_checks, win_system_eventID.
	3.	No UI Update after 8th Day Prediction:
	•	Fixed by appending the 8th-day logs to existing 7-day logs instead of replacing the array.

⸻

Future Improvements
	•	Load real-time logs from a database or OpenSearch.
	•	Support multiple anomaly detection models.
	•	Add filtering, sorting, and export functionality in the UI.
	•	Visualize anomaly trends over time.

⸻
