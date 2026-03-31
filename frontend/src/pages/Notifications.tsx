import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, CreditCard, AlertTriangle, TrendingUp, Loader2, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMySecurityAlerts } from "@/services";
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
const navigate = useNavigate();
const { toast } = useToast();
const [loading, setLoading] = useState(true);
const [notifications, setNotifications] = useState<any[]>([]);

useEffect(() => {
const fetchNotifications = async () => {
try {
setLoading(true);
        
// Fetch security alerts as notifications
const alertsRes = await getMySecurityAlerts({ limit: 20 });
if (alertsRes.success && alertsRes.data) {
const formattedNotifications = alertsRes.data.map((alert: any) => {
const isUnread = alert.status === 'ACTIVE';
let icon = Shield;
let color = "text-info";
let bg = "bg-info/10";

// Determine icon and color based on alert type
if (alert.type.includes('FRAUD')) {
icon = AlertTriangle;
color = "text-danger";
bg = "bg-danger/10";
} else if (alert.type.includes('TRANSACTION')) {
icon = TrendingUp;
color = "text-success";
bg = "bg-success/10";
} else if (alert.type.includes('ACCOUNT')) {
icon = Shield;
color = "text-warning";
bg = "bg-warning/10";
}

return {
id: alert.alertId,
type: alert.type.toLowerCase(),
icon: icon,
title: alert.type.replace(/_/g, ' '),
description: alert.description,
time: new Date(alert.createdAt).toLocaleDateString(),
read: alert.status !== 'ACTIVE',
color: color,
bg: bg,
};
});
setNotifications(formattedNotifications);
} else {
// Set default notifications if no alerts
setNotifications([
{
id: 1,
type: "security",
icon: Shield,
title: "Welcome to SecurePay",
description: "Your account is now active with fraud protection enabled",
time: "Today",
read: false,
color: "text-info",
bg: "bg-info/10",
},
]);
}
} catch (error: any) {
console.log("No notifications available");
// Set empty or default notifications
setNotifications([]);
} finally {
setLoading(false);
}
};

fetchNotifications();
}, []);

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
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Unread Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {notifications.filter((n) => !n.read).length} unread notifications
          </p>
        </div>

        {/* Notification List */}
        <div className="space-y-3">
        {notifications.length === 0 ? (
        <Card className="p-8 text-center">
        <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">No notifications</p>
        <p className="text-sm text-muted-foreground">You're all caught up!</p>
        </Card>
        ) : (
        notifications.map((notification) => {
        const Icon = notification.icon;
        return (
        <Card
        key={notification.id}
        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        !notification.read ? "bg-primary/5 border-primary/20" : ""
        }`}
        >
        <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${notification.bg}`}>
        <Icon className={`h-6 w-6 ${notification.color}`} />
        </div>
        <div className="flex-1">
        <div className="flex items-start justify-between mb-1">
        <p className={`font-semibold capitalize ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
        {notification.title}
        </p>
        {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-primary" />
        )}
        </div>
        <p className="text-sm text-muted-foreground mb-2">
        {notification.description}
        </p>
        <p className="text-xs text-muted-foreground">
        {notification.time}
        </p>
        </div>
        </div>
        </Card>
        );
        })
        )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
