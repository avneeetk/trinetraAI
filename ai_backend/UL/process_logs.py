"""
Script to clean and preprocess security event logs from the dataset.
Outputs a processed CSV ready for anomoly detection/modeling.
"""

import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib


RAW_FILE = os.path.join(os.path.dirname(__file__), "opensearch_reduced.csv")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "processed_logs.csv")
PREPROCESSOR_PATH = os.path.join(os.path.dirname(__file__), "preprocessor.pkl")

def load_data(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    print(f"[*] Loading data from '{file_path}'...")
    df = pd.read_csv(file_path, low_memory=False)   
    print(f"[*] Data loaded successfully: {df.shape[0]} rows, {df.shape[1]} columns")
    return df

def select_features(df):
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

    # Convert timestamps
    if 'data.timestamp' in df.columns:
        df['data.timestamp'] = pd.to_datetime(df['data.timestamp'], errors='coerce')
        df['hour'] = df['data.timestamp'].dt.hour
        df['day_of_week'] = df['data.timestamp'].dt.day_name()
        categorical.append('day_of_week')
        numeric.append('hour')

    selected = [col for col in categorical + numeric if col in df.columns]
    df = df[selected].copy()

    # Convert numerics safely
    for col in numeric:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Convert categoricals to string
    for col in categorical:
        if col in df.columns:
            df[col] = df[col].astype(str).fillna("missing")

    # 🔎 Debug: show any numeric columns that are still object dtype
    bad_numeric = [col for col in numeric if col in df.columns and df[col].dtype == "object"]
    if bad_numeric:
        print("[!] Warning: These numeric columns are not numeric:", bad_numeric)
        print(df[bad_numeric].head(20))

    return df, categorical, numeric

def build_preprocessor(categorical, numeric):
    """
    Creates preprocessing pipeline:
    - Impute missing values
    - Encode categorical vars
    - Scale numeric vars
    """

    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('encoder', OneHotEncoder(handle_unknown='ignore'))
    ])

    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('categorical', cat_transformer, categorical),
            ('numerical', num_transformer, numeric)
        ]
    )
    return preprocessor

def process_logs():
    df, categorical, numeric = select_features(load_data(RAW_FILE))

    for col in categorical:
        if col in df.columns:
            df[col] = df[col].astype(str)

    preprocessor = build_preprocessor(categorical, numeric)

    print("[*] Fitting preprocessing pipeline...")
    processed_array = preprocessor.fit_transform(df)

    print("[+] Transformation complete. Shape:", processed_array.shape)

    processed_df = pd.DataFrame(
        processed_array.toarray() if hasattr(processed_array, 'toarray') else processed_array
    )
    processed_df.to_csv(OUTPUT_FILE, index=False)
    print(f"[+] Saved processed dataset to '{OUTPUT_FILE}'")

    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    print(f"[+] Saved preprocessor pipeline to '{PREPROCESSOR_PATH}'")

if __name__ == "__main__":
    process_logs()