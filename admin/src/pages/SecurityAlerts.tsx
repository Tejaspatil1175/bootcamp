import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Lock, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { securityAPI } from '@/api';
import type { SecurityAlert } from '@/types/api';

const severityColors = {
CRITICAL: 'destructive',
HIGH: 'warning',
MEDIUM: 'default',
LOW: 'secondary',
} as const;

const getAlertIcon = (type: string) => {
switch (type) {
case 'ACCOUNT_FROZEN':
return Lock;
case 'SUSPICIOUS_TRANSACTION':
case 'HIGH_RISK_TRANSACTION':
return AlertTriangle;
case 'SIM_SWAP_DETECTED':
case 'LOCATION_ANOMALY':
return Shield;
default:
return WifiOff;
}
};

export default function SecurityAlerts() {
const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
const [loading, setLoading] = useState(true);
const [stats, setStats] = useState({
total: 0,
active: 0,
resolved: 0,
critical: 0
});

useEffect(() => {
fetchAlerts();
fetchStats();
}, []);

const fetchAlerts = async () => {
try {
setLoading(true);
const response = await securityAPI.getSecurityAlerts({
status: 'OPEN',
page: 1,
limit: 50
});
setAlerts(response.alerts);
} catch (error) {
const errorMessage = error instanceof Error ? error.message : 'Failed to load security alerts';
toast.error(errorMessage);
} finally {
setLoading(false);
}
};

const fetchStats = async () => {
try {
const statsData = await securityAPI.getSecurityStats();
setStats({
total: statsData.totalAlerts || 0,
active: statsData.openAlerts || 0,
resolved: statsData.resolvedAlerts || 0,
critical: statsData.criticalAlerts || 0
});
} catch (error) {
console.error('Failed to load stats:', error);
}
};

const handleResolve = async (alertId: string) => {
const notes = prompt('Please enter resolution notes:');
if (!notes) return;

try {
await securityAPI.resolveAlert(alertId, { notes });
toast.success('Alert marked as resolved');
fetchAlerts();
fetchStats();
} catch (error) {
const errorMessage = error instanceof Error ? error.message : 'Failed to resolve alert';
toast.error(errorMessage);
}
};

const formatTimestamp = (dateString: string) => {
return new Date(dateString).toLocaleString('en-US', {
month: 'short',
day: 'numeric',
year: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
};

if (loading) {
return (
<div className="flex items-center justify-center h-96">
<p className="text-muted-foreground">Loading security alerts...</p>
</div>
);
}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Alerts</h1>
        <p className="text-muted-foreground">
          Monitor and respond to security events across the platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="text-2xl font-bold">{stats.total}</div>
      </CardContent>
      </Card>
      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Active</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="text-2xl font-bold text-destructive">{stats.active}</div>
      </CardContent>
      </Card>
      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Resolved</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="text-2xl font-bold text-success">{stats.resolved}</div>
      </CardContent>
      </Card>
      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Critical</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
      </CardContent>
      </Card>
      </div>

      <Card>
      <CardHeader>
      <CardTitle>Active Alerts</CardTitle>
      </CardHeader>
      <CardContent>
      {alerts.length === 0 ? (
      <p className="text-muted-foreground text-center py-8">No active security alerts</p>
      ) : (
      <div className="space-y-4">
      {alerts.map((alert) => {
      const Icon = getAlertIcon(alert.type);
      return (
      <div
      key={alert.alertId}
      className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
      >
      <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
      <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
      <p className="font-semibold">{alert.type.replace(/_/g, ' ')}</p>
      <Badge variant={severityColors[alert.severity]}>
      {alert.severity}
      </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{alert.message}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{alert.userId.email}</span>
      <span>•</span>
      <span>{formatTimestamp(alert.createdAt)}</span>
      </div>
      </div>
      </div>
      <Button
      size="sm"
      variant="outline"
      onClick={() => handleResolve(alert.alertId)}
      className="sm:shrink-0"
      >
      Mark Resolved
      </Button>
      </div>
      );
      })}
      </div>
      )}
      </CardContent>
      </Card>
    </div>
  );
}
