import React from 'react';
import { Alert } from '../../types/dashboard';
import { CheckCircle, XCircle, Shield, User, Clock, Server, BookOpen, TrendingUp, Cpu, HardDrive, Mail } from 'lucide-react';

interface AlertDetailsProps {
  alert: Alert | null;
  onAction: (alertId: string, action: 'resolve' | 'false_positive' | 'escalate') => void;
}

export const AlertDetails: React.FC<AlertDetailsProps> = React.memo(({ alert, onAction }) => {
  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!alert) {
    return (
      <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center text-gray-500">
          <Shield className="h-10 w-10 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-1">Select an alert to view details</p>
          <p className="text-sm text-gray-400">Click on an alert in the Live Threat Feed.</p>
        </div>
      </div>
    );
  }

  const isActionable = alert.status === 'Open';

  const getIconForField = (field: string) => {
    switch (field) {
      case 'src_ip': return <Server className="h-4 w-4 text-gray-500" />;
      case 'username': return <User className="h-4 w-4 text-gray-500" />;
      case 'process': return <Cpu className="h-4 w-4 text-gray-500" />;
      case 'file_name': return <HardDrive className="h-4 w-4 text-gray-500" />;
      case 'port': return <Shield className="h-4 w-4 text-gray-500" />;
      case 'agentOs': return <Server className="h-4 w-4 text-gray-500" />;
      case 'day_of_week': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return null;
    }
  };

  const getFriendlyFieldName = (field: string) => {
    const map: Record<string, string> = {
      'src_ip': 'Source IP',
      'username': 'Username',
      'process': 'Process',
      'file_name': 'File Name',
      'port': 'Port',
      'agentOs': 'OS',
      'day_of_week': 'Day',
    };
    return map[field] || field;
  };

  const getAlertSpecificDetails = () => {
    const details: Record<string, string> = {};
    const relevantFields = ['src_ip', 'username', 'dest_ip', 'process', 'file_name', 'port', 'day_of_week', 'agentOs'];
    
    relevantFields.forEach(field => {
      const value = (alert as any)[field];
      if (value && value !== 'N/A' && value !== 'Unknown') {
        details[field] = value;
      }
    });
    return details;
  };

  const alertSpecificDetails = getAlertSpecificDetails();


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">Alert Details</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(alert.severity)}`}>
            {alert.severity}
          </span>
        </div>
      </div>

      <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 text-base">{alert.type}</h4>
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">{alert.description || alert.logExcerpt || 'No detailed description available.'}</p>
          </div>

          {alert.risk_score !== undefined && (
            <div className="border-t border-b border-gray-100 py-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Risk Score</p>
                  <p className={`text-2xl font-bold ${alert.risk_score > 70 ? 'text-red-600' : alert.risk_score > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {alert.risk_score}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-600">Alert ID</p>
                <p className="font-medium text-gray-800">{alert.id}</p>
              </div>
            </div>
            
            {Object.entries(alertSpecificDetails).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                    {getIconForField(key)}
                    <div>
                        <p className="text-gray-600">{getFriendlyFieldName(key)}</p>
                        <p className="font-medium text-gray-800">{value}</p>
                    </div>
                </div>
            ))}
            
            <div className="col-span-2">
              <p className="text-gray-600">Status</p>
              <p className="font-medium text-gray-800">{alert.status}</p>
            </div>
          </div>

          {alert.suggestedPlaybook && alert.suggestedPlaybook.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Suggested Actions</p>
              <div className="space-y-2">
                {alert.suggestedPlaybook.map((action, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <BookOpen className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => onAction(alert.id, 'resolve')}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!isActionable}
        >
          <CheckCircle className="h-4 w-4" />
          Mark Resolved
        </button>
        <button
          onClick={() => onAction(alert.id, 'false_positive')}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!isActionable}
        >
          <XCircle className="h-4 w-4" />
          False Positive
        </button>
        <button
          onClick={() => onAction(alert.id, 'escalate')}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!isActionable}
        >
          Escalate
        </button>
      </div>
    </div>
  );
});
