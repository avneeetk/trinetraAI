"""
Preprocessing pipeline for log data.
Handles feature selection, cleaning, and transformation.
"""

import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OrdinalEncoder, StandardScaler
import joblib
import os
from typing import Tuple, List, Union

# --- Paths ---
BASE_DIR = os.path.dirname(__file__)
RAW_FILE = os.path.join(BASE_DIR, "opensearch_reduced.csv")
PROCESSED_FILE = os.path.join(BASE_DIR, "processed_logs.csv")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "preprocessor.pkl")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.json")

def load_data(file_path: str, sample_size: int = None, random_state: int = 42) -> pd.DataFrame:
    """Load and optionally sample data from CSV file."""
    print(f"[*] Loading data from {file_path}...")
    if sample_size:
        n_rows = sum(1 for _ in open(file_path)) - 1  # Count rows
        if n_rows > sample_size:
            skip = sorted(np.random.RandomState(random_state).randint(1, n_rows, n_rows - sample_size))
            df = pd.read_csv(file_path, skiprows=skip, low_memory=False)
            print(f"[*] Sampled {sample_size} rows from {n_rows}")
        else:
            df = pd.read_csv(file_path, low_memory=False)
    else:
        df = pd.read_csv(file_path, low_memory=False)
    
    print(f"[+] Data loaded successfully: {df.shape[0]} rows, {df.shape[1]} cols")
    return df

def select_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str], List[str]]:
    """Select and prepare features for modeling."""
    categorical = [
        'agent.name', 'agent.ip', 'data.alert_type',
        'data.win.system.channel', 'data.win.system.providerName',
        'data.win.eventdata.processName', 'data.win.eventdata.user',
        'data.win.eventdata.ruleName', 'data.win.system.severityValue'
    ]
    
    numeric = [
        'data.sca.score', 'data.sca.total_checks',
        'data.vulnerability.cvss.cvss3.base_score',
        'data.win.system.eventID'
    ]

    # Add time-based features if timestamp is available
    if 'data.timestamp' in df.columns:
        try:
            df['data.timestamp'] = pd.to_datetime(df['data.timestamp'], errors='coerce')
            df['hour'] = df['data.timestamp'].dt.hour.astype(str)
            df['day_of_week'] = df['data.timestamp'].dt.day_name().astype(str)
            categorical.extend(['hour', 'day_of_week'])
        except Exception as e:
            print(f"[!] Warning: Could not process timestamp: {e}")

    # Select only columns that exist in the dataframe
    selected_cat = [col for col in categorical if col in df.columns]
    selected_num = [col for col in numeric if col in df.columns]
    
    # Create a copy with only selected columns
    df_selected = df[selected_cat + selected_num].copy()
    
    # Convert data types
    for col in selected_num:
        df_selected[col] = pd.to_numeric(df_selected[col], errors='coerce').fillna(0)
    
    for col in selected_cat:
        df_selected[col] = df_selected[col].astype(str).fillna('missing')
    
    print(f"[*] Selected {len(selected_cat)} categorical and {len(selected_num)} numeric features")
    return df_selected, selected_cat, selected_num

def build_preprocessor(categorical: List[str], numeric: List[str]) -> ColumnTransformer:
    """Build a preprocessing pipeline for the data."""
    # Preprocessing for numerical data
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Preprocessing for categorical data
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('encoder', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1))
    ])
    
    # Combine preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric),
            ('cat', categorical_transformer, categorical)
        ])
    
    return preprocessor

def process_logs(sample_size: int = 100, random_state: int = 42) -> None:
    """Main function to process logs and save preprocessed data."""
    # Load and prepare data
    df = load_data(RAW_FILE, sample_size=sample_size, random_state=random_state)
    df_processed, categorical, numeric = select_features(df)
    
    # Build and fit preprocessor
    preprocessor = build_preprocessor(categorical, numeric)
    X_processed = preprocessor.fit_transform(df_processed)
    
    # Save processed data
    df_processed.to_csv(PROCESSED_FILE, index=False)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    
    # Save schema information
    schema = {
        'categorical': categorical,
        'numeric': numeric,
        'original_columns': df_processed.columns.tolist()
    }
    import json
    with open(SCHEMA_PATH, 'w') as f:
        json.dump(schema, f, indent=2)
    
    print(f"[+] Saved processed dataset to '{PROCESSED_FILE}'")
    print(f"[+] Saved preprocessor to '{PREPROCESSOR_PATH}'")
    print(f"[+] Saved schema to '{SCHEMA_PATH}'")

if __name__ == "__main__":
    process_logs(sample_size=100)