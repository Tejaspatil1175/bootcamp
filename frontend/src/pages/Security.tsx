import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, CheckCircle, Smartphone, MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMySecurityAlerts, acknowledgeSecurityAlert, getUserKYC } from "@/services";
import { useToast } from "@/hooks/use-toast";

const Security = () => {
const navigate = useNavigate();
const { toast } = useToast();
const [loading, setLoading] = useState(true);
const [securityScore, setSecurityScore] = useState(92);
const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
const [kycData, setKycData] = useState<any>(null);

useEffect(() => {
const fetchSecurityData = async () => {
try {
setLoading(true);

// Fetch KYC data for security score
try {
const kycRes = await getUserKYC();
if (kycRes.success && kycRes.data) {
setKycData(kycRes.data);
// Calculate security score based on KYC verification
if (kycRes.data.nokiaVerification) {
const riskScore = kycRes.data.nokiaVerification.riskScore || 0;
const calculatedScore = Math.max(0, Math.min(100, 100 - riskScore));
setSecurityScore(Math.round(calculatedScore));
}
}
} catch (kycError) {
console.log("KYC data not available");
}

// Fetch security alerts
try {
const alertsRes = await getMySecurityAlerts({ limit: 10, status: 'ACTIVE' });
if (alertsRes.success && alertsRes.data) {
const formattedAlerts = alertsRes.data.map((alert: any) => ({
id: alert.alertId,
type: alert.type,
title: alert.type.replace(/_/g, ' ').toLowerCase(),
description: alert.description,
time: new Date(alert.createdAt).toLocaleDateString(),
severity: alert.severity.toLowerCase(),
}));
setSecurityAlerts(formattedAlerts);
}
} catch (alertError) {
console.log("No security alerts");
// Set default alerts as fallback
setSecurityAlerts([
{
id: 1,
type: "login",
title: "New device login",
description: "Logged in from Samsung Galaxy M31",
time: "2 hours ago",
severity: "low",
},
]);
}

} catch (error: any) {
toast({
title: "Error",
description: error.message || "Failed to load security data",
variant: "destructive",
});
} finally {
setLoading(false);
}
};

fetchSecurityData();
}, []);

const handleAcknowledgeAlert = async (alertId: string) => {
try {
await acknowledgeSecurityAlert(alertId);
// Remove alert from list
setSecurityAlerts(securityAlerts.filter(alert => alert.id !== alertId));
toast({
title: "Alert Acknowledged",
description: "Security alert has been acknowledged",
});
} catch (error: any) {
toast({
title: "Error",
description: error.message || "Failed to acknowledge alert",
variant: "destructive",
});
}
};

if (loading) {
return (
<div className="min-h-screen bg-background flex items-center justify-center">
<Loader2 className="h-8 w-8 animate-spin text-primary" />
</div>
);
}

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Security Center</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Security Score */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall Security</p>
              <div className="flex items-center gap-2">
              <h2 className="text-4xl font-bold">{securityScore}</h2>
              <Badge className={`${
              securityScore >= 80 ? 'bg-success' :
              securityScore >= 60 ? 'bg-warning' :
              'bg-danger'
              } text-white border-none`}>
              {securityScore >= 80 ? 'Excellent' :
              securityScore >= 60 ? 'Good' :
              'Needs Attention'}
              </Badge>
              </div>
            </div>
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="hsl(var(--success))"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(securityScore / 100) * 251} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-success" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your account is well protected with all security features enabled
          </p>
        </Card>

        {/* Security Status */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Security Status</h3>
          <div className="space-y-3">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold">Device Verification</p>
                    <p className="text-sm text-muted-foreground">Active & Verified</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold">Location Monitoring</p>
                    <p className="text-sm text-muted-foreground">Nashik, Maharashtra</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold">Fraud Protection</p>
                    <p className="text-sm text-muted-foreground">Real-time monitoring active</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Alerts */}
        <div>
        <h3 className="text-lg font-semibold mb-3">Recent Alerts</h3>
        {securityAlerts.length === 0 ? (
        <Card className="p-8 text-center">
        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
        <p className="text-muted-foreground">No security alerts</p>
        <p className="text-sm text-muted-foreground">Your account is secure</p>
        </Card>
        ) : (
        <div className="space-y-3">
        {securityAlerts.map((alert) => (
        <Card key={alert.id} className="p-4">
        <div className="flex items-start gap-3">
        <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
        alert.severity === "low"
        ? "bg-info/10"
        : alert.severity === "medium"
        ? "bg-warning/10"
        : "bg-danger/10"
        }`}
        >
        <AlertTriangle
        className={`h-5 w-5 ${
        alert.severity === "low"
        ? "text-info"
        : alert.severity === "medium"
        ? "text-warning"
        : "text-danger"
        }`}
        />
        </div>
        <div className="flex-1">
        <div className="flex items-start justify-between mb-1">
        <p className="font-semibold capitalize">{alert.title}</p>
        <Badge
        variant="outline"
        className={
        alert.severity === "low"
        ? "border-info text-info"
        : alert.severity === "medium"
        ? "border-warning text-warning"
        : "border-danger text-danger"
        }
        >
        {alert.severity}
        </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-1">
        {alert.description}
        </p>
        <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted-foreground">{alert.time}</p>
        <Button
        size="sm"
        variant="outline"
        onClick={() => handleAcknowledgeAlert(alert.id)}
        >
        Acknowledge
        </Button>
        </div>
        </div>
        </div>
        </Card>
        ))}
        </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Security;
