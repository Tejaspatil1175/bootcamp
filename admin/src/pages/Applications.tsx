import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { applicationsAPI } from '@/api';
import type { Application } from '@/types/api';

export default function Applications() {
const [applications, setApplications] = useState<Application[]>([]);
const [loading, setLoading] = useState(true);
const [stats, setStats] = useState({
total: 0,
pending: 0,
approved: 0,
rejected: 0
});

useEffect(() => {
fetchApplications();
}, []);

const fetchApplications = async () => {
try {
setLoading(true);
// Fetch all applications (not just pending)
const response = await applicationsAPI.getAllApplications({
page: 1,
limit: 100
});

// Handle different response structures
const applicationsData = response?.applications || [];

// Filter to show only pending in the table
const pendingApps = applicationsData.filter(app => app.status === 'pending');
setApplications(pendingApps);

// Calculate stats from all applications
const stats = {
total: applicationsData.length,
pending: applicationsData.filter(app => app.status === 'pending').length,
approved: applicationsData.filter(app => app.status === 'approved').length,
rejected: applicationsData.filter(app => app.status === 'rejected').length
};
setStats(stats);

} catch (error) {
console.error('Error fetching applications:', error);
const errorMessage = error instanceof Error ? error.message : 'Failed to load applications';
toast.error(errorMessage);
setApplications([]);
} finally {
setLoading(false);
}
};

const handleApprove = async (applicationId: string) => {
try {
await applicationsAPI.approveApplication(applicationId, 'Application meets all criteria');
toast.success('Application approved successfully');
fetchApplications();
} catch (error) {
const errorMessage = error instanceof Error ? error.message : 'Failed to approve application';
toast.error(errorMessage);
}
};

const handleReject = async (applicationId: string) => {
const reason = prompt('Please enter rejection reason:');
if (!reason) return;

try {
await applicationsAPI.rejectApplication(applicationId, reason);
toast.success('Application rejected successfully');
fetchApplications();
} catch (error) {
const errorMessage = error instanceof Error ? error.message : 'Failed to reject application';
toast.error(errorMessage);
}
};

const formatCurrency = (amount: number) => {
return new Intl.NumberFormat('en-IN', {
style: 'currency',
currency: 'INR',
maximumFractionDigits: 0
}).format(amount);
};

const formatDate = (dateString: string) => {
return new Date(dateString).toLocaleDateString('en-US', {
year: 'numeric',
month: 'short',
day: 'numeric'
});
};

if (loading) {
return (
<div className="flex items-center justify-center h-96">
<p className="text-muted-foreground">Loading applications...</p>
</div>
);
}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loan Applications</h1>
        <p className="text-muted-foreground">
          Review and approve loan applications with Nokia verification
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="text-2xl font-bold">{stats.total}</div>
      </CardContent>
      </Card>
      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="text-2xl font-bold text-warning">{stats.pending}</div>
      </CardContent>
      </Card>
      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Approved</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="text-2xl font-bold text-success">{stats.approved}</div>
      </CardContent>
      </Card>
      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Rejected</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
      </CardContent>
      </Card>
      </div>

      <Card>
      <CardHeader>
      <CardTitle>Pending Applications</CardTitle>
      </CardHeader>
      <CardContent>
      {applications.length === 0 ? (
      <p className="text-muted-foreground text-center py-8">No pending applications</p>
      ) : (
      <Table>
      <TableHeader>
      <TableRow>
      <TableHead>Application ID</TableHead>
      <TableHead>Applicant</TableHead>
      <TableHead>Amount</TableHead>
      <TableHead>Nokia Verified</TableHead>
      <TableHead>Risk Score</TableHead>
      <TableHead>Date</TableHead>
      <TableHead className="text-right">Actions</TableHead>
      </TableRow>
      </TableHeader>
      <TableBody>
      {applications.map((app) => (
      <TableRow key={app.applicationId}>
      <TableCell className="font-medium">{app.applicationId.slice(-8)}</TableCell>
      <TableCell>{app.userId.name}</TableCell>
      <TableCell>{formatCurrency(app.loanAmount)}</TableCell>
      <TableCell>
      <Badge variant={app.nokiaVerification?.verified ? 'default' : 'destructive'}>
      {app.nokiaVerification?.verified ? 'Verified' : 'Not Verified'}
      </Badge>
      </TableCell>
      <TableCell>
      {app.nokiaVerification?.riskScore ? (
      <div className="flex items-center gap-2">
      <div className="text-sm font-medium">{app.nokiaVerification.riskScore}%</div>
      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
      <div
      className="h-full bg-success"
      style={{ width: `${app.nokiaVerification.riskScore}%` }}
      />
      </div>
      </div>
      ) : (
      <span className="text-muted-foreground">N/A</span>
      )}
      </TableCell>
      <TableCell className="text-muted-foreground">{formatDate(app.createdAt)}</TableCell>
      <TableCell className="text-right">
      <div className="flex justify-end gap-2">
      <Button
      size="sm"
      variant="outline"
      onClick={() => handleApprove(app.applicationId)}
      className="gap-1"
      >
      <CheckCircle className="h-3.5 w-3.5" />
      Approve
      </Button>
      <Button
      size="sm"
      variant="destructive"
      onClick={() => handleReject(app.applicationId)}
      className="gap-1"
      >
      <XCircle className="h-3.5 w-3.5" />
      Reject
      </Button>
      </div>
      </TableCell>
      </TableRow>
      ))}
      </TableBody>
      </Table>
      )}
      </CardContent>
      </Card>
    </div>
  );
}
