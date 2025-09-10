// src/data/useCases.ts

import { EventType, SimulationParams } from '../utils/simulationUtils';

export interface UseCase {
  id: string;
  title: string;
  category: string;
  detectionMethod: string;
  triggerConditions: string;
  description: string;
  mitreAttack: string[];
  logSources: string[];
  playbooks: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  simulationFlow: EventType[];
  soarDataParams: SimulationParams;
  soarDataTemplateId: string;
}

export const useCases: UseCase[] = [
  {
    "id": "1",
    "title": "Ransomware File Encryption Detection",
    "category": "Malware Execution",
    "detectionMethod": "EDR - Behavioral Analysis",
    "triggerConditions": "Rapid file extension changes (>50 files/min) + entropy analysis",
    "description": "Advanced behavioral detection system that monitors file system changes and analyzes entropy patterns to identify ransomware encryption activities. Uses machine learning algorithms to distinguish between legitimate file operations and malicious encryption patterns.",
    "mitreAttack": ["T1486 - Data Encrypted for Impact", "T1083 - File and Directory Discovery"],
    "logSources": ["Windows Event Logs", "EDR Telemetry", "File System Monitoring"],
    "playbooks": ["Ransomware Response Playbook", "Endpoint Isolation Procedure"],
    "severity": "critical",
    "simulationFlow": [
      "INITIALIZE_RANSOMWARE_PAYLOAD",
      "DETECT_ENCRYPTION_PATTERN",
      "ALERT_TRIGGERED",
      "ISOLATE_ENDPOINT",
      "TERMINATE_PROCESS",
      "SIMULATION_COMPLETE"
    ],
    "soarDataTemplateId": "RANSOMWARE_GENERIC",
    "soarDataParams": {
      "alertIdSuffix": "RNSM001",
      "ipAddress": "192.168.1.158",
      "malwareName": "crypto_locker.exe",
      "endpointName": "WIN-SERVER-01"
    }
  },
  {
    "id":"9",
    "title": "Malware C2 Communication",
    "category": "Network Threat",
    "detectionMethod": "XDR - Network Analysis",
    "triggerConditions": "Beaconing traffic to known command & control server detected",
    "description": "Trojan communicating with APT infrastructure every 300 seconds from IT workstation.",
    "mitreAttack": ["T1071.001 - Standard Application Layer Protocol", "T1041 - Exfiltration Over C2 Channel"],
    "logSources": ["Network Firewall Logs", "IDS/IPS Logs", "EDR Telemetry"],
    "playbooks": ["Block C2 Domain", "Isolate Host", "Memory Analysis"],
    "severity": "high",
    "simulationFlow": ["UNUSUAL_DNS_QUERIES", "DETECT_DNS_TUNNELING", "ALERT_TRIGGERED", "DNS_BLOCK_RULE", "SIMULATION_COMPLETE"],
    "soarDataTemplateId": "DNS_EXFILTRATION_GENERIC",
    "soarDataParams": {
        "alertIdSuffix": "MCC009",
        "sourceIp": "198.51.100.15",
        "domain": "malicious-c2.com",
    }
  },
  
  {
    "id": "2",
    "title": "Credential Stuffing Attack",
    "category": "Credential Abuse",
    "detectionMethod": "XDR - Log Correlation",
    "triggerConditions": "100+ failed logins from single IP within 10 minutes",
    "description": "Multi-source correlation engine that identifies credential stuffing attacks by analyzing authentication patterns across web applications, VPNs, and internal systems. Includes geolocation analysis and device fingerprinting.",
    "mitreAttack": ["T1110.004 - Credential Stuffing", "T1078 - Valid Accounts"],
    "logSources": ["Authentication Logs", "Web Application Logs", "Network Traffic"],
    "playbooks": ["Credential Abuse Response", "Account Lockout Procedure"],
    "severity": "high",
    "simulationFlow": [
      "BRUTE_FORCE_ATTEMPT",
      "MULTIPLE_FAILED_LOGINS",
      "ALERT_TRIGGERED",
      "ACCOUNT_LOCKOUT",
      "SIMULATION_COMPLETE"
    ],
    "soarDataTemplateId": "CREDENTIAL_STUFFING_GENERIC",
    "soarDataParams": {
      "alertIdSuffix": "CRDS002",
      "ipAddress": "103.20.10.5",
      "username": "admin",
      "service": "VPN"
    }
  },
  
  {
    "id": "3",
    "title": "Living-off-the-Land Binary Abuse",
    "category": "Malware Execution",
    "detectionMethod": "EDR - Process Monitoring",
    "triggerConditions": "PowerShell.exe with encoded commands + suspicious parent process",
    "description": "Sophisticated process behavior analysis that detects abuse of legitimate system binaries. Monitors command-line arguments, parent-child process relationships, and network connections to identify malicious use of trusted tools.",
    "mitreAttack": ["T1059.001 - PowerShell", "T1027 - Obfuscated Files"],
    "logSources": ["Process Creation Events", "Command Line Logs", "Network Connections"],
    "playbooks": ["Living-off-the-Land Response", "Process Analysis Procedure"],
    "severity": "high",
    "simulationFlow": [
      "POWERSHELL_EXECUTION",
      "DETECT_ENCODED_COMMAND",
      "ALERT_TRIGGERED",
      "PROCESS_TERMINATED",
      "SIMULATION_COMPLETE"
    ],
    "soarDataTemplateId": "LOTL_ABUSE_GENERIC",
    "soarDataParams": {
      "alertIdSuffix": "LOTL003",
      "ipAddress": "192.168.1.10",
      "processName": "powershell.exe",
      "user": "jdoe"
    }
  },
  
  {
    "id": "4",
    "title": "Lateral Movement via SMB",
    "category": "Network Threat",
    "detectionMethod": "XDR - Network Analysis",
    "triggerConditions": "Multiple SMB connections to different hosts + admin share access",
    "description": "Network traffic analysis combined with authentication monitoring to detect lateral movement patterns. Identifies unusual SMB activity, credential reuse, and administrative share access across multiple systems.",
    "mitreAttack": ["T1021.002 - SMB/Windows Admin Shares", "T1570 - Lateral Tool Transfer"],
    "logSources": ["Network Traffic Logs", "Windows Security Events", "SMB Logs"],
    "playbooks": ["Lateral Movement Response", "Network Isolation Procedure"],
    "severity": "high",
    "simulationFlow": [
      "SMB_CONNECTION_ATTEMPT",
      "DETECT_ADMIN_SHARE_ACCESS",
      "ALERT_TRIGGERED",
      "NETWORK_SEGMENTATION",
      "SIMULATION_COMPLETE"
    ],
    "soarDataTemplateId": "LATERAL_MOVEMENT_GENERIC",
    "soarDataParams": {
      "alertIdSuffix": "LTMV004",
      "sourceIp": "192.168.1.20",
      "destIp": "192.168.1.30",
      "share": "C$"
    }
  },
  {
    "id": "5",
    "title": "Phishing Email with Malicious Attachment",
    "category": "Email Threat",
    "detectionMethod": "XDR - Email Gateway + Sandbox",
    "triggerConditions": "Email with suspicious attachment + sandbox detonation alerts",
    "description": "Comprehensive email security solution that combines gateway filtering with dynamic sandbox analysis. Detects sophisticated phishing attempts through content analysis, sender reputation, and behavioral indicators.",
    "mitreAttack": ["T1566.001 - Spearphishing Attachment", "T1204.002 - Malicious File"],
    "logSources": ["Email Gateway Logs", "Sandbox Reports", "User Activity Logs"],
    "playbooks": ["Phishing Response Playbook", "Email Quarantine Procedure"],
    "severity": "medium",
    "simulationFlow": [
      "INCOMING_EMAIL_SCAN",
      "MALICIOUS_ATTACHMENT_DETECTED",
      "ALERT_TRIGGERED",
      "EMAIL_QUARANTINE",
      "SIMULATION_COMPLETE"
    ],
    "soarDataTemplateId": "PHISHING_GENERIC",
    "soarDataParams": {
      "alertIdSuffix": "PHSH005",
      "senderEmail": "malicious@bad.com",
      "recipientEmail": "user@cdot.in",
      "attachmentName": "invoice.pdf.exe"
    }
  },
  {
    "id": "6",
    "title": "Privilege Escalation via Token Manipulation",
    "category": "Privilege Escalation",
    "detectionMethod": "EDR - Token Monitoring",
    "triggerConditions": "Token duplication/impersonation + privilege level changes",
    "description": "Advanced Windows token monitoring system that detects privilege escalation attempts through token manipulation techniques. Monitors access token creation, duplication, and impersonation activities.",
    "mitreAttack": ["T1134 - Access Token Manipulation", "T1068 - Exploitation for Privilege Escalation"],
    "logSources": ["Windows Security Events", "EDR Process Logs", "Token Activity Logs"],
    "playbooks": ["Privilege Escalation Response", "Token Analysis Procedure"],
    "severity": "critical",
    "simulationFlow": [
      "TOKEN_MANIPULATION_ATTEMPT",
      "DETECT_PRIVILEGE_CHANGE",
      "ALERT_TRIGGERED",
      "USER_ACCOUNT_LOCKDOWN",
      "SIMULATION_COMPLETE"
    ],
    "soarDataTemplateId": "PRIV_ESCALATION_GENERIC",
    "soarDataParams": {
      "alertIdSuffix": "PRVE006",
      "username": "svc_account",
      "system": "DC01",
      "process": "cmd.exe"
    }
  },
  {
    "id": "7",
    "title": "Data Exfiltration via DNS Tunneling",
    "category": "Data Exfiltration",
    "detectionMethod": "XDR - DNS Traffic Analysis",
    "triggerConditions": "Unusual DNS query patterns + large data volumes",
    "description": "DNS traffic analysis engine that identifies data exfiltration attempts through DNS tunneling. Uses statistical analysis and machine learning to detect anomalous query patterns and data encoding techniques.",
    "mitreAttack": ["T1048.003 - Exfiltration Over Alternative Protocol", "T1071.004 - DNS"],
    "logSources": ["DNS Logs", "Network Traffic Analysis", "DLP Alerts"],
    "playbooks": ["Data Exfiltration Response", "DNS Investigation Procedure"],
    "severity": "high",
    "simulationFlow": [
      "UNUSUAL_DNS_QUERIES",
      "DETECT_DNS_TUNNELING",
      "ALERT_TRIGGERED",
      "DNS_BLOCK_RULE",
      "SIMULATION_COMPLETE"
    ],
    "soarDataTemplateId": "DNS_EXFILTRATION_GENERIC",
    "soarDataParams": {
      "alertIdSuffix": "DNST007",
      "sourceIp": "192.168.1.40",
      "domain": "malicious-c2.com",
      "volume": "500KB"
    }
  },
  {
    "id": "8",
    "title": "Insider Threat - Unusual Data Access",
    "category": "Insider Threat",
    "detectionMethod": "XDR - User Behavior Analytics",
    "triggerConditions": "Access to sensitive data outside normal patterns + bulk downloads",
    "description": "User and Entity Behavior Analytics (UEBA) system that establishes baseline behavior patterns and detects anomalous data access activities. Includes risk scoring and contextual analysis.",
    "mitreAttack": ["T1530 - Data from Cloud Storage Object", "T1005 - Data from Local System"],
    "logSources": ["File Access Logs", "User Activity Logs", "Database Audit Logs"],
    "playbooks": ["Insider Threat Investigation", "Data Access Review Procedure"],
    "severity": "medium",
    "simulationFlow": [
      "UNUSUAL_DATA_ACCESS",
      "DETECT_BULK_DOWNLOAD",
      "ALERT_TRIGGERED",
      "USER_ACCOUNT_REVIEW",
      "SIMULATION_COMPLETE"
    ],
    "soarDataTemplateId": "INSIDER_THREAT_GENERIC",
    "soarDataParams": {
      "alertIdSuffix": "INSD008",
      "username": "bad_employee",
      "dataShare": "sensitive_docs",
      "volume": "10GB"
    }
  }
  
];