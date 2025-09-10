import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AlertFeed } from './AlertFeed';
import { AlertDetails } from './AlertDetails';
import { KPISummary } from './KPISummary';
import { LogViewer } from './LogViewer';
import { SimulationControls } from './SimulationControls';
import { ThreatCharts } from './ThreatCharts';

import { Alert, LogEntry, SimulatedSoarData } from '../../types/dashboard';

export const SOCmain: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { simulatedData } = (location.state as { simulatedData: SimulatedSoarData }) || {
    simulatedData: { alerts: [], eventStream: [] },
  };

  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [eventLogs, setEventLogs] = useState<LogEntry[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1500);

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const allSimulatedItemsRef = useRef<( (Alert & { type: 'alert', _originalDate: Date }) | (LogEntry & { type: 'event', _originalDate: Date }) )[]>([]);
  const currentSimulatedItemIndexRef = useRef(0);

  const severityMap: { [key: string]: number } = {
    'Critical': 9, 'High': 7, 'Medium': 5, 'Low': 3
  };

  const fetchRiskScores = useCallback(async (alerts: Alert[]): Promise<Alert[]> => {
    const alertsForApi = alerts.map(alert => ({
      alert_type_description: alert.type || 'Unknown',
      severity: severityMap[alert.severity] || 0,
      src_ip: alert.sourceIP || alert.ip || 'N/A',
      username: alert.username || alert.user || 'Unknown',
      dest_ip: alert.destIp || 'N/A',
      process: alert.process || 'N/A',
      file_name: alert.fileName || 'N/A',
      port: alert.port || 'N/A',
      logon_hour: new Date(alert.timestamp).getHours(),
      day_of_week: new Date(alert.timestamp).toLocaleDateString('en-US', { weekday: 'long' }),
      agent_os: alert.agentOs || 'Unknown'
    }));

    try {
      const response = await fetch('http://localhost:8000/predict_risk/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertsForApi),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const predictions = await response.json();
      return alerts.map((alert, index) => {
          const prediction = predictions[index];
          if (prediction) {
              return { ...alert, is_high_risk: prediction.is_high_risk, risk_score: prediction.risk_score };
          }
          return alert;
      });
    } catch (error) {
      console.error('Failed to fetch risk scores from AI backend:', error);
      return alerts;
    }
  }, []);

  const startSimulatedRealtimeFeed = useCallback(() => {
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    if (currentSimulatedItemIndexRef.current === 0) {
        allSimulatedItemsRef.current = [
            ...simulatedData.alerts.map(item => ({ ...item, type: 'alert', _originalDate: new Date(item.timestamp) })),
            ...simulatedData.eventStream.map(item => ({ ...item, type: 'event', _originalDate: new Date(item.timestamp) })),
        ].sort((a, b) => a._originalDate.getTime() - b._originalDate.getTime());
    }
    setIsSimulating(true);
    simulationIntervalRef.current = setInterval(() => {
      if (currentSimulatedItemIndexRef.current < allSimulatedItemsRef.current.length) {
        const itemToAdd = allSimulatedItemsRef.current[currentSimulatedItemIndexRef.current];
        const liveTimestamp = new Date().toISOString();
        if (itemToAdd.type === 'alert') {
            setLiveAlerts(prevAlerts => [{ ...(itemToAdd as Alert), id: crypto.randomUUID(), timestamp: liveTimestamp }, ...prevAlerts]);
        } else if (itemToAdd.type === 'event') {
            setEventLogs(prevLogs => [...prevLogs, { ...(itemToAdd as LogEntry), timestamp: liveTimestamp }]);
        }
        currentSimulatedItemIndexRef.current++;
      } else {
        clearInterval(simulationIntervalRef.current);
        setIsSimulating(false);
        simulationIntervalRef.current = null;
      }
    }, simulationSpeed);
  }, [simulatedData, simulationSpeed]);

  const stopSimulatedRealtimeFeed = useCallback(() => {
    setIsSimulating(false);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  }, []);

  const handleStartSimulation = useCallback(() => {
    startSimulatedRealtimeFeed();
  }, [startSimulatedRealtimeFeed]);

  const handleStopSimulation = useCallback(() => {
    stopSimulatedRealtimeFeed();
  }, [stopSimulatedRealtimeFeed]);

  const handleResetSimulation = useCallback(() => {
    stopSimulatedRealtimeFeed();
    setLiveAlerts(simulatedData.alerts);
    setEventLogs(simulatedData.eventStream);
    setSelectedAlert(null);
    currentSimulatedItemIndexRef.current = 0;
    allSimulatedItemsRef.current = [];
    navigate('/');
  }, [simulatedData, stopSimulatedRealtimeFeed, navigate]);

  const handleSpeedChange = useCallback((speed: number) => {
    setSimulationSpeed(speed);
    if (isSimulating) {
      stopSimulatedRealtimeFeed();
      setTimeout(() => startSimulatedRealtimeFeed(), 50);
    }
  }, [isSimulating, stopSimulatedRealtimeFeed, startSimulatedRealtimeFeed]);

  const handleSelectAlert = useCallback((alert: Alert) => setSelectedAlert(alert), []);
  
  const handleAlertAction = useCallback((alertId: string, action: 'resolve' | 'false_positive' | 'escalate') => {
    setLiveAlerts(prevAlerts => prevAlerts.map(alert => {
      if (alert.id === alertId) {
        let newStatus: Alert['status'] = alert.status;
        if (action === 'resolve') newStatus = 'Resolved';
        else if (action === 'false_positive') newStatus = 'False Positive';
        else if (action === 'escalate') newStatus = 'Escalated';
        return { ...alert, status: newStatus };
      }
      return alert;
    }));
    if (selectedAlert?.id === alertId) setSelectedAlert(null);
  }, [selectedAlert]);

  useEffect(() => {
    const initializeDashboard = async () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      stopSimulatedRealtimeFeed();
      setLiveAlerts([]);
      setEventLogs([]);
      setSelectedAlert(null);
      currentSimulatedItemIndexRef.current = 0;
      allSimulatedItemsRef.current = [];

      if (simulatedData.alerts.length > 0) {
        const alertsWithScores = await fetchRiskScores(simulatedData.alerts);
        setLiveAlerts(alertsWithScores);
        setEventLogs(simulatedData.eventStream);
        const initialStartTimeout = setTimeout(() => handleStartSimulation(), 500);
        return () => clearTimeout(initialStartTimeout);
      } else {
         setLiveAlerts([]);
         setEventLogs([]);
         setSelectedAlert(null);
      }
    };
    initializeDashboard();
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [simulatedData, handleStartSimulation, stopSimulatedRealtimeFeed, fetchRiskScores]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Trinetra Cyber Range</h1>
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-semibold text-gray-700 hidden sm:block">Security Operations Center</h3>
          <SimulationControls
            isSimulating={isSimulating}
            onStart={handleStartSimulation}
            onStop={handleStopSimulation}
            onReset={handleResetSimulation}
            speed={simulationSpeed}
            onSpeedChange={handleSpeedChange}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-6">
        <KPISummary alerts={liveAlerts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
        <div className="lg:col-span-1">
          <AlertFeed alerts={liveAlerts} onSelectAlert={handleSelectAlert} selectedAlert={selectedAlert} />
        </div>
        <div className="lg:col-span-1">
          <AlertDetails alert={selectedAlert} onAction={handleAlertAction} />
        </div>
        <div className="col-span-full mt-6">
          <ThreatCharts alerts={liveAlerts} />
        </div>
      </div>
      
      <div className="h-64 flex-shrink-0 mt-6">
        <LogViewer logs={eventLogs} />
      </div>
    </div>
  );
};