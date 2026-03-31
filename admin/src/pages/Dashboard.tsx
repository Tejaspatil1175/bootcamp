import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Users, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { dashboardAPI, securityAPI } from '@/api';
import { toast } from 'sonner';
import type { DashboardStats, SecurityAlert } from '@/types/api';

export default function Dashboard() {
const [stats, setStats] = useState<DashboardStats | null>(null);
const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
try {
setLoading(true);
      
// Fetch dashboard stats
console.log('Fetching dashboard stats...');
const statsData = await dashboardAPI.getStats();
console.log('Dashboard stats received:', statsData);
setStats(statsData);
      
// Fetch recent security alerts (API now returns empty array on error)
console.log('Fetching security alerts...');
const alertsData = await securityAPI.getSecurityAlerts({ status: 'OPEN' });
console.log('Security alerts received:', alertsData);
setRecentAlerts(alertsData.alerts.slice(0, 4)); // Show only 4 recent alerts
      
} catch (error) {
console.error('Dashboard fetch error:', error);
const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
toast.error(errorMessage);
setRecentAlerts([]); // Set empty array on error
} finally {
setLoading(false);
}
};

const severityColors = {
CRITICAL: 'destructive',
HIGH: 'warning',
MEDIUM: 'default',
LOW: 'secondary',
} as const;

const getRelativeTime = (dateString: string) => {
const date = new Date(dateString);
const now = new Date();
const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

if (diff < 60) return `${diff} seconds ago`;
if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
return `${Math.floor(diff / 86400)} days ago`;
};

if (loading) {
return (
<div className="flex items-center justify-center h-96">
<p className="text-muted-foreground">Loading dashboard...</p>
</div>
);
}

if (!stats) {
return (
<div className="flex items-center justify-center h-96">
<p className="text-muted-foreground">Failed to load dashboard data</p>
</div>
);
}

const statsCards = [
{
title: 'Total Transactions',
value: stats.transactions.total.toLocaleString(),
change: '+12.5%',
icon: DollarSign,
trend: 'up',
},
{
title: 'Flagged Transactions',
value: stats.transactions.flagged.toLocaleString(),
change: '-8.2%',
icon: AlertTriangle,
trend: 'down',
},
{
title: 'Active Users',
value: stats.users.active.toLocaleString(),
change: '+5.3%',
icon: Users,
trend: 'up',
},
{
title: 'Security Alerts',
value: stats.security.activeAlerts.toLocaleString(),
change: stats.security.criticalAlerts > 0 ? `${stats.security.criticalAlerts} critical` : '0 critical',
icon: Shield,
trend: stats.security.criticalAlerts > 0 ? 'up' : 'down',
},
];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor fraud detection activities and system performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat) => {
      const Icon = stat.icon;
      return (
      <Card key={stat.title}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
      <div className="text-2xl font-bold">{stat.value}</div>
      <p className="text-xs text-muted-foreground">
      <span className={stat.trend === 'up' ? 'text-success' : 'text-destructive'}>
      {stat.change}
      </span>{' '}
      from last month
      </p>
      </CardContent>
      </Card>
      );
      })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
      <Card>
      <CardHeader>
      <CardTitle>Recent Security Alerts</CardTitle>
      </CardHeader>
      <CardContent>
      {recentAlerts.length === 0 ? (
      <p className="text-muted-foreground text-center py-8">No active alerts</p>
      ) : (
      <div className="space-y-4">
      {recentAlerts.map((alert) => (
      <div
      key={alert.alertId}
      className="flex items-center justify-between rounded-lg border border-border p-3"
      >
      <div className="space-y-1">
      <div className="flex items-center gap-2">
      <p className="font-medium">{alert.type.replace(/_/g, ' ')}</p>
      <Badge variant={severityColors[alert.severity]}>
      {alert.severity}
      </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
      {alert.userId.name} ({alert.userId.email})
      </p>
      </div>
      <p className="text-xs text-muted-foreground">{getRelativeTime(alert.createdAt)}</p>
      </div>
      ))}
      </div>
      )}
      </CardContent>
      </Card>

      <Card>
      <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
      <button
      onClick={() => window.location.href = '/transactions'}
      className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
      >
      <AlertTriangle className="h-5 w-5 text-warning" />
      <div>
      <p className="font-medium">Review Flagged Transactions</p>
      <p className="text-sm text-muted-foreground">{stats.transactions.flagged} pending review</p>
      </div>
      </button>
      <button
      onClick={() => window.location.href = '/security'}
      className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
      >
      <Users className="h-5 w-5 text-primary" />
      <div>
      <p className="font-medium">Manage Frozen Accounts</p>
      <p className="text-sm text-muted-foreground">{stats.security.frozenAccounts} accounts frozen</p>
      </div>
      </button>
      <button
      onClick={() => window.location.href = '/applications'}
      className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
      >
      <CheckCircle className="h-5 w-5 text-success" />
      <div>
      <p className="font-medium">Approve Loan Applications</p>
      <p className="text-sm text-muted-foreground">{stats.applications.pending} awaiting approval</p>
      </div>
      </button>
      </CardContent>
      </Card>
      </div>
    </div>
  );
}
