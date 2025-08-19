import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const metrics = [
  { 
    label: 'Detection Rate', 
    value: '94.2%', 
    change: '+2.1%', 
    trend: 'up',
    icon: Shield,
    color: 'green'
  },
  { 
    label: 'Mean Time to Detection', 
    value: '1.8s', 
    change: '-0.3s', 
    trend: 'down',
    icon: Activity,
    color: 'blue'
  },
  { 
    label: 'Mean Time to Response', 
    value: '3.2s', 
    change: '-0.5s', 
    trend: 'down',
    icon: TrendingUp,
    color: 'purple'
  },
  { 
    label: 'False Positive Rate', 
    value: '2.1%', 
    change: '-0.8%', 
    trend: 'down',
    icon: AlertTriangle,
    color: 'yellow'
  }
];

const threatCategories = [
  { category: 'Malware Execution', incidents: 45, percentage: 35 },
  { category: 'Credential Abuse', incidents: 32, percentage: 25 },
  { category: 'Network Threat', incidents: 28, percentage: 22 },
  { category: 'Insider Threat', incidents: 15, percentage: 12 },
  { category: 'Cloud Threat', incidents: 8, percentage: 6 }
];

const recentTrends = [
  { period: 'Last 7 days', detections: 128, contained: 121, escalated: 5, missed: 2 },
  { period: 'Last 30 days', detections: 542, contained: 510, escalated: 24, missed: 8 },
  { period: 'Last 90 days', detections: 1634, contained: 1541, escalated: 71, missed: 22 }
];

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Security metrics, trends, and performance insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-sm text-green-600 dark:text-green-400">{metric.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}>
                  <Icon className={`w-6 h-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Threat Categories</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {threatCategories.map((item, index) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.category}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.incidents} incidents</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    className="bg-blue-600 h-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Trends</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentTrends.map((trend, index) => (
              <motion.div
                key={trend.period}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{trend.period}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{trend.detections} total</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 dark:text-green-400 font-semibold">{trend.contained}</div>
                    <div className="text-gray-500 dark:text-gray-400">Contained</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-600 dark:text-yellow-400 font-semibold">{trend.escalated}</div>
                    <div className="text-gray-500 dark:text-gray-400">Escalated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 dark:text-red-400 font-semibold">{trend.missed}</div>
                    <div className="text-gray-500 dark:text-gray-400">Missed</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Analytics Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Use Case Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Use Case
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Simulations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Detection Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Response Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  Ransomware File Encryption Detection
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">24</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">95.8%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">1.2s</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">3.1s</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  Credential Stuffing Attack
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">18</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">100%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">0.8s</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">2.3s</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  Living-off-the-Land Binary Abuse
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">15</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400">86.7%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">2.1s</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">4.5s</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};