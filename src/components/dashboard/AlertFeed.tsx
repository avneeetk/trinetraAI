// src/components/dashboard/AlertFeed.tsx
import React from 'react';
import { Alert } from '../../types/dashboard';
import { AlertTriangle, Clock, Shield } from 'lucide-react';

interface AlertFeedProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  selectedAlert: Alert | null;
}

export const AlertFeed: React.FC<AlertFeedProps> = React.memo(({ alerts, onSelectAlert, selectedAlert }) => {
  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700';
      case 'Resolved': return 'bg-green-100 text-green-700';
      case 'False Positive': return 'bg-gray-100 text-gray-700';
      case 'Escalated': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Live Threat Feed</h3>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            {alerts.filter(a => a.status === 'Open').length} Active
          </span>
        </div>
      </div>

      <div className="overflow-y-auto flex-grow">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 flex-col">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No threats detected</p>
            <p className="text-sm">System monitoring active</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedAlert?.id === alert.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => onSelectAlert(alert)}
                role="button"
                aria-pressed={selectedAlert?.id === alert.id}
                aria-label={`Select alert ${alert.id}: ${alert.type}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                    {alert.risk_score !== undefined && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${alert.is_high_risk ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        Risk: {alert.risk_score}%
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
                </div>

                <h4 className="font-medium text-gray-900 mb-1">{alert.type}</h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{alert.logExcerpt || alert.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>ID: {alert.id}</span>
                  {alert.sourceIP && <span>IP: {alert.sourceIP}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
