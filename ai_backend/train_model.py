import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
from sklearn.impute import SimpleImputer
import joblib
import os

def train_model(data_path='cleaned_data.csv', model_output_path='random_forest_model.pkl'):
    # --- Load cleaned data ---
    if not os.path.exists(data_path):
        print(f"ERROR: File '{data_path}' does not exist")
        return 
    
    print(f"[*] Loading cleaned data from '{data_path}'...")
    df = pd.read_csv(data_path)
    print(f"[*] Data loaded successfully: {len(df)} rows")

    # --- Separate features and target ---
    X = df.drop('is_high_risk', axis=1)
    y = df['is_high_risk']

    # --- Identify categorical and numerical features ---
    categorical_features = [
        'alert_type_description', 'src_ip', 'username',
        'dest_ip', 'process', 'file_name', 'agent_os',
        'day_of_week', 'port'
    ]
    numerical_features = ['severity', 'logon_hour']

    # --- Ensure consistent dtypes BEFORE preprocessing ---
    for col in categorical_features:
        X[col] = X[col].astype(str).fillna("missing")  # enforce string

    for col in numerical_features:
        X[col] = pd.to_numeric(X[col], errors="coerce")  # enforce numeric

    # --- Transformers ---
    numerical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median'))  # replace NaNs with median
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')), 
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )

    # --- Build full pipeline ---
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=100, random_state=42, n_jobs=-1
        ))
    ])

    print("[*] Preprocessing and model pipeline created")

    # --- Train/test split ---
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[*] Data split into {len(X_train)} training and {len(X_test)} testing samples")

    # --- Train model ---
    print("[*] Training the model...")
    model_pipeline.fit(X_train, y_train)
    print("[+] Model training completed")

    # --- Evaluate ---
    y_pred = model_pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"[*] Model accuracy on test data: {accuracy:.2f}")
    print("[*] Classification report:\n")
    print(classification_report(y_test, y_pred))

    # --- Save model ---
    joblib.dump(model_pipeline, model_output_path)
    print(f"\n[+] Model saved to '{model_output_path}'")

if __name__ == "__main__":
    train_model()