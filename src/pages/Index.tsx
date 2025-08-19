import React, { useState, useEffect } from 'react';
import { AlertFeed } from '@/components/dashboard/AlertFeed';
import { KPISummary } from '@/components/dashboard/KPISummary';
import { ThreatCharts } from '@/components/dashboard/ThreatCharts';
import { LogViewer } from '@/components/dashboard/LogViewer';
import { AlertDetails } from '@/components/dashboard/AlertDetails';

import { mockAlerts, mockLogs } from '@/data/mockData';
import { Alert, LogEntry } from '@/types/dashboard';

const Index = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSimulating && alerts.length < mockAlerts.length) {
      interval = setInterval(() => {
        const nextAlertIndex = alerts.length;
        if (nextAlertIndex < mockAlerts.length) {
          const newAlert = {
            ...mockAlerts[nextAlertIndex],
            timestamp: new Date().toISOString()
          };
          setAlerts(prev => [...prev, newAlert]);
          
          // Add corresponding log entry
          const logIndex = Math.floor(Math.random() * mockLogs.length);
          const newLog = {
            ...mockLogs[logIndex],
            timestamp: new Date().toISOString()
          };
          setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, alerts.length]);

  const handleAlertAction = (alertId: string, action: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: action === 'resolve' ? 'Resolved' : 'False Positive' }
        : alert
    ));
    
    // Add action log
    const actionLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      source: 'SOC-ANALYST',
      message: `Alert ${alertId} marked as ${action === 'resolve' ? 'resolved' : 'false positive'} by analyst`,
      category: 'analyst_action'
    };
    setLogs(prev => [actionLog, ...prev.slice(0, 49)]);
  };

  const startSimulation = () => {
    setIsSimulating(true);
    if (alerts.length === 0) {
      // Add initial logs
      setLogs(mockLogs.slice(0, 10));
    }
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setAlerts([]);
    setLogs([]);
    setSelectedAlert(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CDOT Security Dashboard</h1>
              <p className="text-sm text-gray-600">xDR • SIEM • SOAR • UEBA Integration Platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI Summary */}
        <div className="mb-6">
          <KPISummary alerts={alerts} />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Alert Feed */}
          <div className="lg:col-span-1">
            <AlertFeed 
              alerts={alerts} 
              onSelectAlert={setSelectedAlert}
              selectedAlert={selectedAlert}
            />
          </div>

          {/* Alert Details */}
          <div className="lg:col-span-1">
            <AlertDetails 
              alert={selectedAlert}
              onAction={handleAlertAction}
            />
          </div>

          {/* Threat Charts */}
          <div className="lg:col-span-1 xl:col-span-2">
            <ThreatCharts alerts={alerts} />
          </div>
        </div>

        {/* Log Viewer */}
        <div className="mb-6">
          <LogViewer logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default Index;
