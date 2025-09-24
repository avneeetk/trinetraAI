import pandas as pd
import joblib
import os
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    average_precision_score,
    precision_recall_curve,
    f1_score
)
import numpy as np
from typing import Tuple
import matplotlib.pyplot as plt
import seaborn as sns

# --- Paths ---
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "one_class_svm.pkl")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "preprocessor.pkl")
TEST_FILE = os.path.join(BASE_DIR, "synthetic_testset.csv")
RESULTS_FILE = os.path.join(BASE_DIR, "svm_results.csv")

# --- Functions ---
def load_data(file_path: str) -> pd.DataFrame:
    """Loads a CSV file into a pandas DataFrame."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    print(f"[*] Loading test set: {file_path}")
    df = pd.read_csv(file_path, low_memory=False)
    print(f"[*] Loaded test set: {df.shape[0]} rows, {df.shape[1]} columns")
    return df

def select_and_prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """Replicates the feature selection and preparation from process_logs.py."""
    categorical = [
        'agent.name', 'agent.ip', 'data.alert_type',
        'data.win.system.channel', 'data.win.system.providerName',
        'data.win.eventdata.processName', 'data.win.eventdata.user',
        'data.win.eventdata.ruleName'  # Include ruleName as a feature
    ]

    numeric = [
        'data.sca.score', 'data.sca.total_checks',
        'data.vulnerability.cvss.cvss3.base_score',
        'data.win.system.eventID', 'data.win.system.severityValue'
    ]

    if 'data.timestamp' in df.columns:
        df['data.timestamp'] = pd.to_datetime(df['data.timestamp'], errors='coerce')
        df['hour'] = df['data.timestamp'].dt.hour
        df['day_of_week'] = df['data.timestamp'].dt.day_name()
        categorical.append('day_of_week')
        numeric.append('hour')

    df_prepared = df[[col for col in categorical + numeric if col in df.columns]].copy()
    
    for col in numeric:
        if col in df_prepared.columns:
            df_prepared[col] = pd.to_numeric(df_prepared[col], errors='coerce')
    
    for col in categorical:
        if col in df_prepared.columns:
            df_prepared[col] = df_prepared[col].astype(str).fillna("missing")
            
    return df_prepared

def plot_score_distribution(scores: np.ndarray, y_true: np.ndarray, save_path: str = None):
    """Plot the distribution of anomaly scores for normal and anomaly classes."""
    plt.figure(figsize=(10, 6))
    sns.histplot(scores[y_true == 1], bins=50, kde=True, color='blue', label='Normal', alpha=0.5)
    sns.histplot(scores[y_true == -1], bins=50, kde=True, color='red', label='Anomaly', alpha=0.5)
    plt.title('Distribution of Anomaly Scores')
    plt.xlabel('Anomaly Score (higher = more normal)')
    plt.legend()
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()

def plot_precision_recall_curve(y_true: np.ndarray, scores: np.ndarray, save_path: str = None):
    """Plot precision-recall curve and return optimal threshold."""
    precision, recall, thresholds = precision_recall_curve(y_true, -scores)
    f1_scores = 2 * (precision * recall) / (precision + recall + 1e-9)
    best_idx = np.argmax(f1_scores)
    best_threshold = -thresholds[best_idx]  # Convert back to original scale
    
    plt.figure(figsize=(10, 6))
    plt.plot(recall, precision, marker='.')
    plt.scatter(recall[best_idx], precision[best_idx], 
                marker='o', color='red', 
                label=f'Best F1 (Threshold: {best_threshold:.2f})')
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve')
    plt.legend()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    return best_threshold

def evaluate_with_threshold(y_true: np.ndarray, scores: np.ndarray, threshold: float = 0.0):
    """Evaluate model performance with a custom decision threshold."""
    y_pred = np.where(scores >= threshold, 1, -1)
    
    print("\n[+] Performance with threshold =", threshold)
    print("\n[+] Confusion Matrix:")
    print(confusion_matrix(y_true, y_pred))
    print("\n[+] Classification Report:")
    print(classification_report(y_true, y_pred, zero_division=0))
    
    return y_pred

def run_evaluation():
    try:
        # Load artifacts
        print("[*] Loading trained model and preprocessor...")
        model = joblib.load(MODEL_PATH)
        preprocessor = joblib.load(PREPROCESSOR_PATH)
        print("[+] Artifacts loaded successfully.")

        # Load data
        df = load_data(TEST_FILE)

        # Split into features + labels
        if "label" not in df.columns:
            raise ValueError("Test set must contain a 'label' column with ground truth (1=normal, -1=anomaly)")
        X_raw = df.drop(columns=["label"])
        y_true = df["label"].values
        
        # Prepare features for the preprocessor
        X_prepared = select_and_prepare_features(X_raw)

        # Transform features
        print("[*] Transforming features...")
        X_trans = preprocessor.transform(X_prepared)
        
        # Convert sparse matrix to dense array for OneClassSVM
        if hasattr(X_trans, 'toarray'):
            X_trans = X_trans.toarray()
            
        # Get raw anomaly scores
        scores = model.decision_function(X_trans)
        
        # Plot score distribution
        plot_score_distribution(scores, y_true, 'svm_score_distribution.png')
        
        # Find optimal threshold
        best_threshold = plot_precision_recall_curve(y_true, scores, 'svm_pr_curve.png')
        
        # Evaluate with default threshold (0.0)
        print("\n=== Evaluation with default threshold (0.0) ===")
        y_pred_default = evaluate_with_threshold(y_true, scores, 0.0)
        
        # Evaluate with optimal threshold
        print(f"\n=== Evaluation with optimal threshold ({best_threshold:.4f}) ===")
        y_pred_optimal = evaluate_with_threshold(y_true, scores, best_threshold)
        
        # Save detailed results
        df_results = df.copy()
        df_results["anomaly_score"] = scores
        df_results["predicted_label_default"] = y_pred_default
        df_results["predicted_label_optimal"] = y_pred_optimal
        df_results.to_csv(RESULTS_FILE, index=False)
        print(f"[+] Saved detailed results to {RESULTS_FILE}")
        
        # Print best threshold for production use
        print("\n[+] Recommended threshold for production:", best_threshold)

    except FileNotFoundError as e:
        print(f"[!] Error: {e}")
        print("[!] Please ensure the model, preprocessor, and test data files exist in the same directory.")
    except Exception as e:
        print(f"[!] An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_evaluation()