import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { mockLogs } from '../data/logs';

interface LogRow {
  agent_name: string;
  agent_ip: string;
  data_alert_type: string;
  hour: number;
  day_of_week: string;
  sca_score: number;
  sca_total_checks: number;
  win_system_eventID: number;
  anomaly_score?: number;
  anomaly_label?: number;
  data?: {
    win?: {
      eventdata?: {
        ruleName?: string;
        processName?: string;
        user?: string;
      };
      system?: {
        channel?: string;
        severityValue?: string | number;
      };
    };
  };
}

export const AnomalyDetector: React.FC = () => {
  const [trainingStatus, setTrainingStatus] = useState<'idle'|'training'|'trained'|'error'>('idle');
  const [predictionStatus, setPredictionStatus] = useState<'idle'|'predicting'|'predicted'|'error'>('idle');
  const [logsData, setLogsData] = useState<LogRow[]>([]);
  const [summary, setSummary] = useState<{total: number, anomalies: number}>({total: 0, anomalies: 0});
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const sevenDayLogs = mockLogs.slice(0, 14);  // 2 logs per day
  const eighthDayLogs = mockLogs.slice(14, 19); // 5 logs for 8th day

  // Initialize 7-day logs
  useEffect(() => {
    const initialLogs = sevenDayLogs.map(log => ({
      agent_name: log['agent.name'] || 'missing',
      agent_ip: log['agent.ip'] || 'N/A',
      data_alert_type: log['data.alert_type'] || 'N/A',
      hour: log.hour ?? 0,
      day_of_week: log.day_of_week || 'Unknown',
      sca_score: log['data.sca.score'] ?? 0,
      sca_total_checks: log['data.sca.total_checks'] ?? 0,
      win_system_eventID: log['data.win.system.eventID'] ?? 0,
      data: {
        win: {
          eventdata: {
            ruleName: log['data.win.eventdata.ruleName'],
            processName: log['data.win.eventdata.processName'],
            user: log['data.win.eventdata.user']
          },
          system: {
            channel: log['data.win.system.channel'],
            severityValue: log['data.win.system.severityValue']
          }
        }
      },
      anomaly_score: log.anomaly_score,
      anomaly_label: log.anomaly_label
    }));
    setLogsData(initialLogs);
    setSummary({ total: initialLogs.length, anomalies: 0 });
  }, []);

  const handleTrainModel = async () => {
    setTrainingStatus('training');
    try {
      const payload = logsData.map(log => ({
        agent_name: log.agent_name,
        agent_ip: log.agent_ip,
        data_alert_type: log.data_alert_type,
        hour: log.hour,
        day_of_week: log.day_of_week,
        sca_score: log.sca_score,
        sca_total_checks: log.sca_total_checks,
        win_system_eventID: log.win_system_eventID
      }));

      const response = await fetch("http://localhost:8001/train_anomaly/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const result = await response.json();
      setTrainingStatus('trained');
      if (result.training_anomalies !== undefined)
        setSummary(prev => ({ ...prev, anomalies: result.training_anomalies }));
    } catch (error) {
      console.error('Training failed:', error);
      setTrainingStatus('error');
    }
  };

  const handlePredictAnomalies = async () => {
    setPredictionStatus('predicting');
    try {
      const payload = eighthDayLogs.map(log => ({
        agent_name: log['agent.name'],
        agent_ip: log['agent.ip'],
        data_alert_type: log['data.alert_type'],
        hour: log.hour,
        day_of_week: log.day_of_week,
        sca_score: log['data.sca.score'] ?? 0,
        sca_total_checks: log['data.sca.total_checks'] ?? 0,
        win_system_eventID: log['data.win.system.eventID'] ?? 0
      }));

      const response = await fetch("http://localhost:8001/predict_anomaly/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const results: {log_index:number, anomaly_score:number, anomaly_label:number}[] = await response.json();

      // Merge results with 8th-day logs
      const updatedLogs = eighthDayLogs.map((log, idx) => ({
        agent_name: log['agent.name'],
        agent_ip: log['agent.ip'],
        data_alert_type: log['data.alert_type'],
        hour: log.hour,
        day_of_week: log.day_of_week,
        sca_score: log['data.sca.score'] ?? 0,
        sca_total_checks: log['data.sca.total_checks'] ?? 0,
        win_system_eventID: log['data.win.system.eventID'] ?? 0,
        anomaly_score: results[idx]?.anomaly_score,
        anomaly_label: results[idx]?.anomaly_label,
        data: {
          win: {
            eventdata: {
              ruleName: log['data.win.eventdata.ruleName'],
              processName: log['data.win.eventdata.processName'],
              user: log['data.win.eventdata.user']
            },
            system: {
              channel: log['data.win.system.channel'],
              severityValue: log['data.win.system.severityValue']
            }
          }
        }
      }));

      setLogsData(updatedLogs);
      const anomaliesCount = updatedLogs.filter(l => l.anomaly_label === -1).length;
      setSummary({ total: updatedLogs.length, anomalies: anomaliesCount });
      setPredictionStatus('predicted');
    } catch (e) {
      console.error('Prediction failed:', e);
      setPredictionStatus('error');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="mb-6 w-full">
        <CardHeader>
          <CardTitle>Anomaly Detection</CardTitle>
          <CardDescription>Train on past 7 days logs and predict anomalies for the 8th day.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={handleTrainModel} disabled={trainingStatus==='training'} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center">
            {trainingStatus==='training' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
            {trainingStatus==='training' ? 'Training...' : 'Start Training'}
          </Button>

          <Button onClick={handlePredictAnomalies} disabled={trainingStatus!=='trained' || predictionStatus==='predicting'} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center">
            {predictionStatus==='predicting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
            {predictionStatus==='predicting' ? 'Predicting...' : 'Predict 8th Day'}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6 w-full">
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent className="flex gap-4">
          <div>Total Logs: {summary.total}</div>
          <div>Anomalies Detected: {summary.anomalies}</div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader><CardTitle>Logs</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Alert Type</TableHead>
                <TableHead>Hour</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Anomaly</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsData.map((log, idx) => (
                <React.Fragment key={idx}>
                  <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}>
                    <TableCell className="font-medium">{log.agent_name}</TableCell>
                    <TableCell>{log.agent_ip || 'N/A'}</TableCell>
                    <TableCell>{log.data_alert_type || 'N/A'}</TableCell>
                    <TableCell>{log.hour}</TableCell>
                    <TableCell>{log.day_of_week}</TableCell>
                    <TableCell className="flex items-center justify-between">
                      {log.anomaly_label === -1 ? <Badge variant="destructive">Anomaly</Badge> : <Badge variant="secondary">Normal</Badge>}
                      {expandedRow === idx ? <ChevronDown className="h-4 w-4 ml-2"/> : <ChevronRight className="h-4 w-4 ml-2"/>}
                    </TableCell>
                  </TableRow>

                  {expandedRow === idx && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gray-50 p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Process</p>
                            <p className="text-gray-600">{log.data?.win?.eventdata?.processName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">User</p>
                            <p className="text-gray-600">{log.data?.win?.eventdata?.user || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Rule Name</p>
                            <p className="text-gray-600">{log.data?.win?.eventdata?.ruleName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Channel</p>
                            <p className="text-gray-600">{log.data?.win?.system?.channel || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Severity</p>
                            <p className="text-gray-600">{log.data?.win?.system?.severityValue || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Anomaly Score</p>
                            <p className="text-gray-600">{log.anomaly_score !== undefined ? log.anomaly_score.toFixed(4) : 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};