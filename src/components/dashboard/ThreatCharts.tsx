import React, { useMemo } from 'react';
import { Alert } from '../../types/dashboard';
import {
  PieChart,
  Pie,
  Cell,
  ComposedChart, 
  Bar, 
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ThreatChartsProps {
  alerts: Alert[];
}

const COLORS: { [key in Alert['severity'] | 'Default' | 'High Risk' | 'Normal Risk']: string } = {
  'Critical': '#EF4444',
  'High': '#F97316',
  'Medium': '#FACC15',
  'Low': '#22C55E',
  'Default': '#A0A0A0',
  'High Risk': '#EF4444',
  'Normal Risk': '#22C55E',
};

const ALERT_TYPE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#6366f1', '#f43f5e', '#d946b2', '#7C3AED'];

const createTimeBins = (alerts: Alert[], numBins = 8) => {
    const validAlerts = alerts.filter(a => {
        const t = new Date(a.timestamp).getTime();
        return !Number.isNaN(t);
    });
    if (validAlerts.length === 0) {
        const baseline = [];
        const now = new Date();
        for (let i = 0; i < 8; i++) {
            const time = new Date(now.getTime() - (7 - i) * 60 * 60 * 1000);
            baseline.push({
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                total: 0,
                critical: 0,
                high_risk: 0
            });
        }
        return baseline;
    }

    const sortedAlerts = [...validAlerts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const firstTimestamp = new Date(sortedAlerts[0].timestamp).getTime();
    const lastTimestamp = new Date(sortedAlerts[sortedAlerts.length - 1].timestamp).getTime();
    const timeSpan = lastTimestamp - firstTimestamp;
    
    if (timeSpan === 0) {
        return [
          {
            time: new Date(firstTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            total: sortedAlerts.length,
            critical: sortedAlerts.filter(a => a.severity === 'Critical').length,
            high_risk: sortedAlerts.filter(a => a.is_high_risk).length,
          },
        ];
    }
    
    const interval = timeSpan / numBins;

    const bins = Array(numBins + 1).fill(0).map((_, i) => ({
        time: new Date(firstTimestamp + i * interval).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        total: 0,
        critical: 0,
        high_risk: 0
    }));

    sortedAlerts.forEach(alert => {
        const alertTime = new Date(alert.timestamp).getTime();
        let binIndex = Math.floor((alertTime - firstTimestamp) / interval);
        if (binIndex >= numBins) binIndex = numBins;

        bins[binIndex].total += 1;
        if (alert.severity === 'Critical') {
            bins[binIndex].critical += 1;
        }
        if (alert.is_high_risk) {
            bins[binIndex].high_risk += 1;
        }
    });

    return bins;
};


export const ThreatCharts: React.FC<ThreatChartsProps> = React.memo(({ alerts }) => {
  const { pieData, severityData, riskData, timelineData } = useMemo(() => {
    const alertsByType = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(alertsByType).map(([type, count]) => ({
      name: type,
      value: count
    }));

    const alertsBySeverity = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityData = Object.entries(alertsBySeverity).map(([severity, count]) => ({
      name: severity,
      value: count,
      fill: COLORS[severity as Alert['severity']] || COLORS.Default
    })).sort((a, b) => {
      const order = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return (order[b.name as keyof typeof order] || 0) - (order[a.name as keyof typeof order] || 0);
    });

    const riskDistribution = alerts.reduce((acc, alert) => {
      const riskType = alert.is_high_risk ? 'High Risk' : 'Normal Risk';
      acc[riskType] = (acc[riskType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const riskData = Object.entries(riskDistribution).map(([name, value]) => ({
      name,
      value
    }));

    const timelineData = createTimeBins(alerts);
    
    return { pieData, severityData, riskData, timelineData };
  }, [alerts]);


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full flex flex-col">
      <div className="p-2 border-b border-gray-200 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900">Threat Intelligence & Analytics</h3>
      </div>

      <div className="flex-grow grid grid-rows-3 gap-4">
        {alerts.length === 0 ? (
          <div className="col-span-full flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="text-lg font-medium">No threat data available</p>
              <p className="text-sm text-gray-400">Start simulation to see analytics populate.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-auto flex flex-col items-center justify-center border-r pr-2 border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">AI Risk Distribution</h4>
                {riskData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={60}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name as 'High Risk' | 'Normal Risk'] || COLORS.Default} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={10} iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-500 text-center text-xs py-4">No risk data.</div>
                )}
              </div>

              <div className="h-auto flex flex-col items-center justify-center pl-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">Alerts by Severity</h4>
                {severityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={severityData}>
                      <RadialBar dataKey="value" cornerRadius={4} fill="#8884d8" />
                      <Tooltip />
                      <Legend />
                    </RadialBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-500 text-center text-xs py-4">No severity data.</div>
                )}
              </div>
            </div>

            <div className="row-span-1 h-auto flex flex-col items-center justify-center border-t pt-4 border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">Alert Timeline</h4>
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart data={timelineData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                    <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#6b7280" allowDecimals={false} style={{ fontSize: '10px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: '#1f2937', fontWeight: 500, marginBottom: '4px' }}
                      itemStyle={{ color: '#4b5563', padding: '2px 0' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="total" stackId="alerts" fill="#3b82f6" name="Total Alerts" />
                    <Bar dataKey="critical" stackId="alerts" fill="#ef4444" name="Critical" />
                    <Line
                      type="monotone"
                      dataKey="high_risk"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
                      name="AI High Risk"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 text-center text-xs py-4">No timeline data available</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

ThreatCharts.displayName = 'ThreatCharts';

