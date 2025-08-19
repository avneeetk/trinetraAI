import React, { useState } from 'react';
import { Activity, Filter, Download, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimulationLog {
  id: string;
  timestamp: string;
  useCase: string;
  category: string;
  result: 'contained' | 'escalated' | 'missed';
  duration: string;
  analyst: string;
  detectionTime: string;
  responseTime: string;
}

const simulationLogs: SimulationLog[] = [
  {
    id: '1',
    timestamp: '2024-01-15 14:32:15',
    useCase: 'Ransomware File Encryption Detection',
    category: 'Malware Execution',
    result: 'contained',
    duration: '4m 23s',
    analyst: 'John Smith',
    detectionTime: '1.2s',
    responseTime: '3.1s'
  },
  {
    id: '2',
    timestamp: '2024-01-15 13:45:22',
    useCase: 'Credential Stuffing Attack',
    category: 'Credential Abuse',
    result: 'contained',
    duration: '2m 15s',
    analyst: 'Sarah Johnson',
    detectionTime: '0.8s',
    responseTime: '2.3s'
  },
  {
    id: '3',
    timestamp: '2024-01-15 12:18:45',
    useCase: 'Living-off-the-Land Binary Abuse',
    category: 'Malware Execution',
    result: 'escalated',
    duration: '6m 42s',
    analyst: 'Mike Chen',
    detectionTime: '2.1s',
    responseTime: '4.5s'
  },
  {
    id: '4',
    timestamp: '2024-01-15 11:22:33',
    useCase: 'Suspicious PowerShell Execution',
    category: 'Malware Execution',
    result: 'contained',
    duration: '3m 18s',
    analyst: 'Emily Davis',
    detectionTime: '0.9s',
    responseTime: '2.8s'
  },
  {
    id: '5',
    timestamp: '2024-01-15 10:55:12',
    useCase: 'Lateral Movement via SMB',
    category: 'Network Threat',
    result: 'missed',
    duration: '8m 15s',
    analyst: 'Alex Rodriguez',
    detectionTime: '5.2s',
    responseTime: 'N/A'
  }
];

interface SimulationLogsProps {
  timeFilter: string;
}

export const SimulationLogs: React.FC<SimulationLogsProps> = ({ timeFilter }) => {
  const [selectedResult, setSelectedResult] = useState('All');

  const results = ['All', 'contained', 'escalated', 'missed'];

  const filteredLogs = simulationLogs.filter(log => 
    selectedResult === 'All' || log.result === selectedResult
  );

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'contained':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'escalated':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'missed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'contained':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'escalated':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'missed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Malware Execution': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'Credential Abuse': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'Network Threat': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'Cloud Threat': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'Insider Threat': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Simulation Logs</h1>
          <p className="text-gray-600 dark:text-gray-400">History of executed threat simulations and results</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredLogs.length} simulations
          </span>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
          >
            {results.map(result => (
              <option key={result} value={result}>
                {result === 'All' ? 'All Results' : result.charAt(0).toUpperCase() + result.slice(1)}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Time Range: {timeFilter}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {simulationLogs.filter(log => log.result === 'contained').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contained</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {simulationLogs.filter(log => log.result === 'escalated').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Escalated</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {simulationLogs.filter(log => log.result === 'missed').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Missed</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {((simulationLogs.filter(log => log.result === 'contained').length / simulationLogs.length) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Use Case
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Analyst
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{log.timestamp}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs">
                      {log.useCase}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(log.category)}`}>
                      {log.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getResultIcon(log.result)}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getResultColor(log.result)}`}>
                        {log.result}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>Duration: {log.duration}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Detection: {log.detectionTime} | Response: {log.responseTime}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{log.analyst}</div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};