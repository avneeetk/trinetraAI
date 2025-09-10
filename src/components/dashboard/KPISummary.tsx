import React from 'react';
import { Alert } from '../../types/dashboard';
import { TrendingUp, AlertTriangle, Clock, CheckCircle, Shield, Activity } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass?: string;
  bgColorClass?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
}

const KpiCard: React.FC<KpiCardProps> = React.memo(({
  title, value, icon: Icon, colorClass = 'text-gray-900', bgColorClass = 'bg-white', trend, trendValue
}) => {
  const getTrendArrow = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return '▲';
    if (trend === 'down') return '▼';
    return '';
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      case 'neutral': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`rounded-lg shadow-sm p-4 border border-gray-200 transition-all duration-300 hover:shadow-lg ${bgColorClass}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      {trend && trendValue !== undefined && (
        <p className={`text-xs mt-1 ${getTrendColor(trend)} flex items-center gap-1`}>
          {getTrendArrow(trend)} {trendValue}
        </p>
      )}
    </div>
  );
});

interface KPISummaryProps {
  alerts: Alert[];
}

export const KPISummary: React.FC<KPISummaryProps> = React.memo(({ alerts }) => {
  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter(alert => alert.status === 'Open').length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'Critical' && alert.status === 'Open').length;
  const resolvedAlerts = alerts.filter(alert => alert.status === 'Resolved').length;
  
  const highestRiskScore = alerts.reduce((max, alert) => Math.max(max, alert.risk_score || 0), 0);
  const threatScore = Math.floor(highestRiskScore);

  const mttd = '18m';
  const mttr = '56m';

  return (
      <>
      <KpiCard
        title="Active Threats"
        value={activeAlerts}
        icon={AlertTriangle}
        colorClass="text-red-600"
        bgColorClass="bg-red-50"
        trend="up"
        trendValue={activeAlerts > 0 ? activeAlerts : '0'}
      />
      <KpiCard
        title="Critical Alerts"
        value={criticalAlerts}
        icon={Shield}
        colorClass="text-orange-600"
        bgColorClass="bg-orange-50"
        trend="up"
        trendValue={criticalAlerts > 0 ? criticalAlerts : '0'}
      />
      <KpiCard
        title="Total Alerts"
        value={totalAlerts}
        icon={Activity}
        colorClass="text-blue-600"
        bgColorClass="bg-blue-50"
        trend="up"
        trendValue={totalAlerts > 0 ? totalAlerts : '0'}
      />
      <KpiCard
        title="Resolved"
        value={resolvedAlerts}
        icon={CheckCircle}
        colorClass="text-green-600"
        bgColorClass="bg-green-50"
        trend="up"
        trendValue={resolvedAlerts > 0 ? resolvedAlerts : '0'}
      />
      <KpiCard
        title="MTTD"
        value={mttd}
        icon={Clock}
        colorClass="text-purple-600"
        bgColorClass="bg-purple-50"
      />
      <KpiCard
        title="MTTR"
        value={mttr}
        icon={Clock}
        colorClass="text-indigo-600"
        bgColorClass="bg-indigo-50"
      />
      <KpiCard
        title="Threat Score"
        value={`${threatScore}%`}
        icon={AlertTriangle}
        colorClass={threatScore > 70 ? 'text-red-600' : threatScore > 40 ? 'text-yellow-600' : 'text-green-600'}
        bgColorClass={threatScore > 70 ? 'bg-red-50' : threatScore > 40 ? 'bg-yellow-50' : 'bg-green-50'}
        trend={threatScore > 0 ? 'up' : 'neutral'}
        trendValue={threatScore > 0 ? `+${threatScore}` : '0'}
      />
    </>
  );
});