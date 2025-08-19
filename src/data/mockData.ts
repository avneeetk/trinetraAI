
import { Alert, LogEntry } from '@/types/dashboard';

export const mockAlerts: Alert[] = [
  {
    id: "TRI-1001",
    type: "Phishing Email Detected",
    user: "ananya.m@cdot.in",
    severity: "High",
    timestamp: "2025-07-06T09:15:00Z",
    sourceIP: "203.0.113.45",
    status: "Open",
    logExcerpt: "Malicious URL detected in email attachment from external sender",
    suggestedPlaybook: ["Quarantine Email", "Block Sender Domain", "User Training"],
    description: "Advanced phishing campaign targeting finance department with credential harvesting attempt.",
    affectedSystems: ["Email Gateway", "CDOT-WS-042"]
  },
  {
    id: "TRI-1002",
    type: "Ransomware Activity",
    severity: "Critical",
    timestamp: "2025-07-06T09:32:00Z",
    sourceIP: "192.168.1.158",
    status: "Open",
    logExcerpt: "Suspicious file encryption pattern detected on endpoint",
    suggestedPlaybook: ["Isolate Host", "Kill Processes", "Restore from Backup", "Incident Response"],
    description: "Ransomware payload detected encrypting files on HR department workstation.",
    affectedSystems: ["CDOT-HR-015", "File Server"]
  },
  {
    id: "TRI-1003",
    type: "Brute Force Attack",
    user: "admin",
    severity: "High",
    timestamp: "2025-07-06T09:45:00Z",
    sourceIP: "185.220.101.32",
    status: "Open",
    logExcerpt: "500+ failed login attempts detected from foreign IP",
    suggestedPlaybook: ["Block IP Range", "Account Lockout", "Enable MFA", "Notify Admin"],
    description: "Coordinated brute force attack targeting administrative accounts from botnet.",
    affectedSystems: ["Active Directory", "VPN Gateway"]
  },
  {
    id: "TRI-1004",
    type: "Data Exfiltration",
    user: "contractor.ext@cdot.in",
    severity: "Critical",
    timestamp: "2025-07-06T10:12:00Z",
    sourceIP: "10.0.5.24",
    status: "Open",
    logExcerpt: "Large encrypted data transfer to external cloud storage detected",
    suggestedPlaybook: ["Block Transfer", "Investigate User", "Legal Hold", "Forensic Analysis"],
    description: "Suspicious 2.5GB encrypted file upload to unauthorized cloud service during off-hours.",
    affectedSystems: ["CDOT-FILE-SRV", "Cloud Proxy", "DLP Engine"]
  },
  {
    id: "TRI-1005",
    type: "Privilege Escalation",
    user: "temp.user@cdot.in",
    severity: "High",
    timestamp: "2025-07-06T10:30:00Z",
    sourceIP: "172.16.0.89",
    status: "Open",
    logExcerpt: "Temporary account elevated to domain admin without approval",
    suggestedPlaybook: ["Revoke Privileges", "Account Review", "Audit Trail Analysis"],
    description: "Unauthorized privilege escalation detected on contractor account outside normal hours.",
    affectedSystems: ["Active Directory", "Privilege Access Management"]
  },
  {
    id: "TRI-1006",
    type: "Malware C2 Communication",
    severity: "High",
    timestamp: "2025-07-06T10:45:00Z",
    sourceIP: "198.51.100.15",
    status: "Open",
    logExcerpt: "Beaconing traffic to known command & control server detected",
    suggestedPlaybook: ["Block C2 Domain", "Isolate Host", "Memory Analysis", "IOC Hunt"],
    description: "Trojan communicating with APT infrastructure every 300 seconds from IT workstation.",
    affectedSystems: ["Network Firewall", "CDOT-IT-023", "IDS/IPS"]
  },
  {
    id: "TRI-1007",
    type: "Insider Threat",
    user: "disgruntled.emp@cdot.in",
    severity: "Medium",
    timestamp: "2025-07-06T11:00:00Z",
    sourceIP: "192.168.2.101",
    status: "Open",
    logExcerpt: "Unusual file access pattern detected outside normal working hours",
    suggestedPlaybook: ["Monitor Activity", "Manager Notification", "Access Review"],
    description: "Employee accessing sensitive files 3x normal rate during weekend hours.",
    affectedSystems: ["File Server", "UEBA Engine"]
  },
  {
    id: "TRI-1008",
    type: "Cloud Account Compromise",
    user: "cloud.admin@cdot.in",
    severity: "Critical",
    timestamp: "2025-07-06T11:15:00Z",
    sourceIP: "203.0.113.89",
    status: "Open",
    logExcerpt: "AWS console access from unusual geolocation detected",
    suggestedPlaybook: ["Disable Account", "Rotate Keys", "Review Permissions", "Geo-blocking"],
    description: "Cloud administrator account accessed from suspicious IP in different country.",
    affectedSystems: ["AWS Console", "Cloud Security Posture"]
  },
  {
    id: "TRI-1009",
    type: "DNS Tunneling",
    severity: "High",
    timestamp: "2025-07-06T11:30:00Z",
    sourceIP: "10.1.1.67",
    status: "Open",
    logExcerpt: "Suspicious DNS queries with encoded payload detected",
    suggestedPlaybook: ["Block DNS Queries", "Network Segmentation", "Deep Packet Inspection"],
    description: "Data exfiltration via DNS tunneling protocol detected from finance workstation.",
    affectedSystems: ["DNS Server", "CDOT-FIN-067", "Network Monitor"]
  },
  {
    id: "TRI-1010",
    type: "Zero-Day Exploit",
    severity: "Critical",
    timestamp: "2025-07-06T11:45:00Z",
    sourceIP: "45.77.162.33",
    status: "Open",
    logExcerpt: "Unknown exploit pattern targeting web application vulnerability",
    suggestedPlaybook: ["Emergency Patch", "WAF Rules", "System Isolation", "Vendor Contact"],
    description: "Previously unknown attack vector exploiting web application framework vulnerability.",
    affectedSystems: ["Web Application", "Load Balancer", "WAF"]
  },
  {
    id: "TRI-1011",
    type: "Cryptocurrency Mining",
    severity: "Medium",
    timestamp: "2025-07-06T12:00:00Z",
    sourceIP: "192.168.3.45",
    status: "Open",
    logExcerpt: "High CPU usage and mining pool connections detected",
    suggestedPlaybook: ["Kill Process", "Malware Scan", "Performance Analysis"],
    description: "Unauthorized cryptocurrency mining malware consuming system resources.",
    affectedSystems: ["CDOT-DEV-045", "Performance Monitor"]
  },
  {
    id: "TRI-1012",
    type: "Lateral Movement",
    user: "compromised.user@cdot.in",
    severity: "High",
    timestamp: "2025-07-06T12:15:00Z",
    sourceIP: "10.0.2.88",
    status: "Open",
    logExcerpt: "SMB enumeration and credential dumping attempts detected",
    suggestedPlaybook: ["Isolate Network Segment", "Credential Reset", "Hunt IOCs"],
    description: "Attacker moving laterally through network using compromised credentials.",
    affectedSystems: ["Domain Controller", "Multiple Workstations"]
  }
];

export const mockLogs: LogEntry[] = [
  {
    id: "log-001",
    timestamp: "2025-07-06T12:22:01Z",
    level: "ERROR",
    source: "sshd",
    message: "Failed password for invalid user admin from 185.220.101.32 port 54321 ssh2",
    category: "authentication"
  },
  {
    id: "log-002",
    timestamp: "2025-07-06T12:21:45Z",
    level: "WARN",
    source: "firewall",
    message: "DENY TCP 203.0.113.45:443 -> 10.0.1.100:80 (suspicious TLS handshake)",
    category: "network"
  },
  {
    id: "log-003",
    timestamp: "2025-07-06T12:21:30Z",
    level: "INFO",
    source: "antivirus",
    message: "Threat signature update completed - 2,847 new IoCs added to database",
    category: "security"
  },
  {
    id: "log-004",
    timestamp: "2025-07-06T12:21:15Z",
    level: "ERROR",
    source: "web-filter",
    message: "Blocked phishing site access: evil-bank-login.tk by user ananya.m@cdot.in",
    category: "web_security"
  },
  {
    id: "log-005",
    timestamp: "2025-07-06T12:21:00Z",
    level: "WARN",
    source: "dlp-engine",
    message: "Large encrypted file transfer: 2.5GB to dropbox.com by contractor.ext@cdot.in",
    category: "data_loss_prevention"
  },
  {
    id: "log-006",
    timestamp: "2025-07-06T12:20:45Z",
    level: "INFO",
    source: "active-directory",
    message: "Successful logon: john.doe@cdot.in from workstation CDOT-WS-031 (10.0.1.31)",
    category: "authentication"
  },
  {
    id: "log-007",
    timestamp: "2025-07-06T12:20:30Z",
    level: "ERROR",
    source: "ids",
    message: "Malware callback detected: 192.168.1.158 -> malware-c2.evil.com:8080",
    category: "intrusion_detection"
  },
  {
    id: "log-008",
    timestamp: "2025-07-06T12:20:15Z",
    level: "WARN",
    source: "email-gateway",
    message: "Quarantined attachment: invoice.exe (Win32.Trojan.Generic) from finance-dept@fake.com",
    category: "email_security"
  },
  {
    id: "log-009",
    timestamp: "2025-07-06T12:20:00Z",
    level: "INFO",
    source: "backup-system",
    message: "Incremental backup completed: 847GB backed up to secure vault",
    category: "system"
  },
  {
    id: "log-010",
    timestamp: "2025-07-06T12:19:45Z",
    level: "ERROR",
    source: "cloud-security",
    message: "Suspicious AWS console login from IP 203.0.113.89 (Brazil) for cloud.admin@cdot.in",
    category: "cloud_security"
  },
  {
    id: "log-011",
    timestamp: "2025-07-06T12:19:30Z",
    level: "WARN",
    source: "ueba-engine",
    message: "Anomalous behavior: disgruntled.emp@cdot.in file access 300% above baseline",
    category: "user_behavior"
  },
  {
    id: "log-012",
    timestamp: "2025-07-06T12:19:15Z",
    level: "ERROR",
    source: "dns-monitor",
    message: "DNS tunneling detected: encoded data in TXT queries to suspicious-domain.tk",
    category: "network_security"
  },
  {
    id: "log-013",
    timestamp: "2025-07-06T12:19:00Z",
    level: "INFO",
    source: "vulnerability-scanner",
    message: "Weekly scan completed: 23 high-risk vulnerabilities identified across network",
    category: "vulnerability_management"
  },
  {
    id: "log-014",
    timestamp: "2025-07-06T12:18:45Z",
    level: "WARN",
    source: "privilege-monitor",
    message: "Privilege escalation detected: temp.user@cdot.in elevated to Domain Admin",
    category: "privilege_management"
  },
  {
    id: "log-015",
    timestamp: "2025-07-06T12:18:30Z",
    level: "ERROR",
    source: "endpoint-detection",
    message: "Ransomware behavior detected: mass file encryption on CDOT-HR-015",
    category: "endpoint_security"
  }
];
