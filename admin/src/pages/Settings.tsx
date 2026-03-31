import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function Settings() {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your admin preferences and system configuration
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for critical security events
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>High-Risk Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified immediately for high-risk transactions
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a daily summary of fraud detection activities
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fraud Detection Thresholds</CardTitle>
            <CardDescription>Adjust risk scoring parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="high-risk">High Risk Threshold (%)</Label>
              <Input id="high-risk" type="number" defaultValue="80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medium-risk">Medium Risk Threshold (%)</Label>
              <Input id="medium-risk" type="number" defaultValue="50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auto-freeze">Auto-Freeze Amount ($)</Label>
              <Input id="auto-freeze" type="number" defaultValue="5000" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Manage external service integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nokia-api">Nokia API Endpoint</Label>
              <Input id="nokia-api" defaultValue="https://api.nokia.com/fraud-check" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-timeout">API Timeout (seconds)</Label>
              <Input id="api-timeout" type="number" defaultValue="30" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
