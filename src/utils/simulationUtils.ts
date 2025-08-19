// src/utils/simulationUtils.ts
import soarDataTemplates from '../data/DataTemplates.json';
import { UseCase } from '../data/useCases';

/**
 * Defines the event types as a union of string literals
 */
export type EventType =
  | "INITIALIZE_RANSOMWARE_PAYLOAD"
  | "DETECT_ENCRYPTION_PATTERN"
  | "BRUTE_FORCE_ATTEMPT"
  | "MULTIPLE_FAILED_LOGINS"
  | "POWERSHELL_EXECUTION"
  | "DETECT_ENCODED_COMMAND"
  | "SMB_CONNECTION_ATTEMPT"
  | "DETECT_ADMIN_SHARE_ACCESS"
  | "INCOMING_EMAIL_SCAN"
  | "MALICIOUS_ATTACHMENT_DETECTED"
  | "TOKEN_MANIPULATION_ATTEMPT"
  | "DETECT_PRIVILEGE_CHANGE"
  | "UNUSUAL_DNS_QUERIES"
  | "DETECT_DNS_TUNNELING"
  | "UNUSUAL_DATA_ACCESS"
  | "DETECT_BULK_DOWNLOAD"
  | "ALERT_TRIGGERED"
  | "ISOLATE_ENDPOINT"
  | "TERMINATE_PROCESS"
  | "ACCOUNT_LOCKOUT"
  | "PROCESS_TERMINATED"
  | "NETWORK_SEGMENTATION"
  | "EMAIL_QUARANTINE"
  | "USER_ACCOUNT_LOCKDOWN"
  | "DNS_BLOCK_RULE"
  | "USER_ACCOUNT_REVIEW"
  | "SIMULATION_COMPLETE";

/**
 * Defines the params interface, mirroring the backend's AlertInput
 */
export interface SimulationParams {
  alertIdSuffix?: string;
  ipAddress?: string;
  service?: string;
  username?: string;
  user?: string;
  processName?: string;
  sourceIp?: string;
  destIp?: string;
  share?: string;
  senderEmail?: string;
  attachmentName?: string;
  system?: string;
  process?: string;
  domain?: string;
  dataShare?: string;
  volume?: string;
  malwareName?: string;
  endpointName?: string;
  agentOs?: string;
  severity?: number;
  logon_hour?: number;
  day_of_week?: string;
}

/**
 * Generates a full log line for the terminal based on an event type and use case parameters.
 * @param eventType - The keyword for the simulation step.
 * @param params - Parameters specific to the use case.
 * @returns The formatted log line.
 */
export const generateTerminalLogLine = (eventType: EventType, params: SimulationParams = {}): string => {
  switch (eventType) {
    case "INITIALIZE_RANSOMWARE_PAYLOAD":
      return `[*] Initializing ransomware payload for ${params.endpointName || 'target endpoint'}...`;
    case "DETECT_ENCRYPTION_PATTERN":
      return `[!] Detecting suspicious file encryption patterns on ${params.ipAddress || 'endpoint'}...`;
    case "BRUTE_FORCE_ATTEMPT":
      return `[*] Initiating brute-force attempt against ${params.service || 'service'} for user '${params.username || 'unknown'}' from ${params.ipAddress || 'unknown IP'}...`;
    case "MULTIPLE_FAILED_LOGINS":
      return `[!] Multiple failed login attempts detected for user '${params.username || 'unknown'}' from ${params.ipAddress || 'unknown IP'}.`;
    case "POWERSHELL_EXECUTION":
      return `[*] Executing suspicious PowerShell script on ${params.ipAddress || 'endpoint'} by user '${params.user || 'unknown'}'...`;
    case "DETECT_ENCODED_COMMAND":
      return `[!] Encoded command detected within '${params.processName || 'process'}' execution.`;
    case "SMB_CONNECTION_ATTEMPT":
      return `[*] Attempting SMB connection from ${params.sourceIp || 'source'} to ${params.destIp || 'destination'}...`;
    case "DETECT_ADMIN_SHARE_ACCESS":
      return `[!] Unauthorized administrative share access to '${params.share || 'unknown share'}' detected.`;
    case "INCOMING_EMAIL_SCAN":
      return `[*] Scanning incoming email from '${params.senderEmail || 'unknown sender'}'...`;
    case "MALICIOUS_ATTACHMENT_DETECTED":
      return `[!] Malicious attachment '${params.attachmentName || 'unknown attachment'}' detected.`;
    case "TOKEN_MANIPULATION_ATTEMPT":
      return `[*] Attempting token manipulation for user '${params.username || 'unknown'}' on system '${params.system || 'unknown system'}'...`;
    case "DETECT_PRIVILEGE_CHANGE":
      return `[!] Unauthorized privilege level change detected for user '${params.username || 'unknown'}' from process '${params.process || 'unknown'}'`;
    case "UNUSUAL_DNS_QUERIES":
      return `[*] Monitoring unusual DNS query patterns from ${params.sourceIp || 'source IP'}...`;
    case "DETECT_DNS_TUNNELING":
      return `[!] Suspected DNS tunneling activity detected to domain '${params.domain || 'unknown domain'}'.`;
    case "UNUSUAL_DATA_ACCESS":
      return `[*] Monitoring data access patterns for user '${params.username || 'unknown'}' on '${params.dataShare || 'unknown share'}'...`;
    case "DETECT_BULK_DOWNLOAD":
      return `[!] Bulk download of ${params.volume || 'unknown volume'} detected by user '${params.username || 'unknown'}'.`;

    // Generic steps
    case "ALERT_TRIGGERED":
      return `[✓] Alert triggered by Trinetra.`;
    case "ISOLATE_ENDPOINT":
      return `[✓] Endpoint ${params.ipAddress || 'target'} isolated.`;
    case "TERMINATE_PROCESS":
      return `[✓] Process '${params.malwareName || 'malicious process'}' terminated.`;
    case "ACCOUNT_LOCKOUT":
      return `[✓] Account '${params.username || 'unknown'}' locked out.`;
    case "PROCESS_TERMINATED":
      return `[✓] Malicious process '${params.processName || 'process'}' terminated.`;
    case "NETWORK_SEGMENTATION":
      return `[✓] Network segment containing ${params.destIp || 'target'} isolated.`;
    case "EMAIL_QUARANTINE":
      return `[✓] Malicious email from '${params.senderEmail || 'unknown sender'}' quarantined.`;
    case "USER_ACCOUNT_LOCKDOWN":
      return `[✓] User account '${params.username || 'unknown'}' locked down.`;
    case "DNS_BLOCK_RULE":
      return `[✓] DNS block rule applied for domain '${params.domain || 'unknown'}'`;
    case "USER_ACCOUNT_REVIEW":
      return `[✓] User account '${params.username || 'unknown'}' flagged for review.`;
    case "SIMULATION_COMPLETE":
      return "--- Simulation Complete --- Redirecting to SOAR Dashboard ---";
    default:
      return `[?] Unrecognized event: ${eventType}`;
  }
};

/**
 * Recursively replaces placeholders in a string or object with provided parameters.
 * @param template - The string or object containing placeholders.
 * @param params - The parameters to substitute.
 * @param baseTimestamp - The base timestamp for relative time placeholders.
 * @returns The template with placeholders replaced.
 */
const replacePlaceholders = (template: any, params: Record<string, any>, baseTimestamp: Date): any => {
  if (typeof template === 'string') {
    let result = template;
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(params[key]));
      }
    }
    // Handle dynamic timestamps
    if (result.includes('${timestamp}')) {
      result = result.replace(/\$\{timestamp\}/g, baseTimestamp.toISOString());
    }
    if (result.includes('${timestamp_plus_')) {
      result = result.replace(/\$\{timestamp_plus_(\d+)s\}/g, (match, seconds) => {
        const newDate = new Date(baseTimestamp.getTime() + parseInt(seconds) * 1000);
        return newDate.toISOString();
      });
    }
    if (result.includes('${uniqueId}')) {
      result = result.replace(/\$\{uniqueId\}/g, Math.random().toString(36).substring(2, 9));
    }
    return result;
  } else if (Array.isArray(template)) {
    return template.map(item => replacePlaceholders(item, params, baseTimestamp));
  } else if (typeof template === 'object' && template !== null) {
    const newObject: { [key: string]: any } = {};
    for (const key in template) {
      newObject[key] = replacePlaceholders(template[key], params, baseTimestamp);
    }
    return newObject;
  }
  return template;
};

export const populateSoarData = (templateId: string, useCaseParams: UseCase['soarDataParams']): { alerts: any[], eventStream: any[] } => {
  const templates: { [key: string]: any } = soarDataTemplates;
  const template = templates[templateId];

  if (!template) {
    console.warn(`SOAR data template '${templateId}' not found in DataTemplates.json.`);
    return { alerts: [], eventStream: [] };
  }

  const baseTimestamp = new Date();

  const populatedData = replacePlaceholders(template, useCaseParams, baseTimestamp);

  return {
    alerts: (populatedData as any).alerts || [],
    eventStream: (populatedData as any).eventStream || []
  };
};
