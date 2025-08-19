// src/types/dashboard.ts
// The central file for all your data interfaces

export interface Alert {
  id: string;
  type: string;
  user?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
  sourceIP: string;
  status: 'Open' | 'Resolved' | 'False Positive' | 'Escalated';
  logExcerpt: string;
  suggestedPlaybook: string[];
  description?: string;
  affectedSystems?: string[];
  malwareName?: string;
  endpointName?: string;
  username?: string;
  ip?: string;
  dest_ip?: string;
  process?: string;
  file_name?: string;
  port?: string;
  logon_hour?: number;
  day_of_week?: string;
  agent_os?: string;
  is_high_risk?: boolean;
  risk_score?: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' |'CRITICAL';
  source: string;
  message: string;
  category: string;
}

export interface KPIData {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  mttd: number;
  mttr: number;
}