import pandas as pd 
import os 
import re 

def process_clean_data(input_file='security_events_10000.csv', output_file='cleaned_data.csv'):
    
    if not os.path.exists(input_file):
        print(f"ERROR: File '{input_file}' does not exist")
        return 
    
    print(f"INFO: Loading data from {input_file}....")
    df = pd.read_csv(input_file)
    print(f"INFO: Data loaded successfully with {len(df)} rows")
    

    # --- Feature Engineering (Target variable) ---
    print("[*] Creating the target variable...")

    df['is_high_risk'] = 0

    high_risk_rules = [
        'Malware detected',
        'User privilege escalation detected',
        "Multiple failed SSH login attempts",
        "Multiple failed RDP login attempts",
        'Suspicious outbound network traffic'
    ]

    df.loc[df['rule_description'].isin(high_risk_rules), 'is_high_risk'] = 1
    df.loc[(df['rule_description'].str.contains('Malware', na=False)) & (df['severity'] > 8), 'is_high_risk'] = 1
    print(df['is_high_risk'].value_counts(normalize=True))
    
    # Simulate false positives
    low_risk_indices = df[df['is_high_risk'] == 0].sample(frac=0.01, random_state=42).index
    df.loc[low_risk_indices, 'is_high_risk'] = 1

    print(f"[+] Target variable created. High-risk samples: {df['is_high_risk'].sum()}")

    # --- Feature extraction from event_data ---
    print("[*] Extracting features from event_data...")

    patterns = {
        'src_ip': r"src_ip=([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)",
        'username': r'username=([a-zA-Z0-9\.]+)',
        'dest_ip': r'dest_ip=([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)',
        'process': r'process=([a-zA-Z0-9\._]+)',
        'file_name': r'file_name=([\w\.\-\\/:]+)',
        'port': r'port=(\d+)'
    }

    for feature, pattern in patterns.items():
        df[feature] = df['event_data'].str.extract(pattern, flags=re.IGNORECASE, expand=False).fillna('N/A').astype(str)

    # --- Create additional features ---
    print("[*] Creating additional features from timestamp and agent_name...")

    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
    df['logon_hour'] = df['timestamp'].dt.hour.fillna(-1).astype(int)
    df['day_of_week'] = df['timestamp'].dt.day_name().fillna("Unknown")

    df['agent_os'] = 'Unknown'
    df.loc[df['agent_name'].str.contains('WIN', case=False, na=False), 'agent_os'] = 'Windows'
    df.loc[df['agent_name'].str.contains('LINUX', case=False, na=False), 'agent_os'] = 'Linux'
    
    # --- Rename after extraction ---
    df.rename(columns={'rule_description': 'alert_type_description'}, inplace=True)

    # --- Enforce data types (AFTER renaming) ---
    print("[*] Ensuring all feature columns have the correct data type...")

    new_dtypes = {
        'alert_type_description': 'string',
        'src_ip': 'string',
        'username': 'string',
        'dest_ip': 'string',
        'process': 'string',
        'file_name': 'string',
        'port': 'string',
        'day_of_week': 'category',
        'agent_os': 'category',
        'severity': 'int64',
        'logon_hour': 'int64'
    }

    for col, dtype in new_dtypes.items():
        if col in df.columns:
            df[col] = df[col].astype(dtype, errors='ignore')

    # --- Drop unused columns ---
    df = df.drop(columns=['event_data', 'alert_id', 'agent_id', 'agent_name', 'rule_id', 'timestamp'])

    # --- Save final output ---
    print(f"[*] Saving processed data to '{output_file}'...")
    df.to_csv(output_file, index=False)
    print("\nSample of cleaned data:")
    print(df.head())

if __name__ == "__main__":
    process_clean_data()