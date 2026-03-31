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
import { Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { usersAPI } from '@/api';
import type { User } from '@/types/api';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [frozenCount, setFrozenCount] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUsers({ page: 1, limit: 100 });
      
      // Handle different response structures
      const usersData = response?.users || [];
      const paginationData = response?.pagination || { total: 0, current: 1, pages: 1 };
      
      setUsers(usersData);
      setTotalUsers(paginationData.total);
      
      // Calculate active and frozen counts
      const active = usersData.filter(u => u.accountStatus === 'active').length;
      const frozen = usersData.filter(u => u.accountStatus === 'frozen').length;
      setActiveCount(active);
      setFrozenCount(frozen);
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load users';
      toast.error(errorMessage);
      // Set empty data on error
      setUsers([]);
      setTotalUsers(0);
      setActiveCount(0);
      setFrozenCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'frozen' : 'active';
    const action = currentStatus === 'active' ? 'freeze' : 'unfreeze';
    
    try {
      await usersAPI.updateUserStatus(
        userId, 
        newStatus as 'active' | 'frozen' | 'suspended',
        `Administrative ${action}`
      );
      
      toast.success(`User account ${action}d successfully`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action} account`;
      toast.error(errorMessage);
    }
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
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and monitor account status
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeCount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Frozen Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{frozenCount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No users found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        user.accountStatus === 'active' ? 'default' : 
                        user.accountStatus === 'frozen' ? 'destructive' : 
                        'secondary'
                      }>
                        {user.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.emailVerified && (
                          <Badge variant="outline" className="text-xs">Email</Badge>
                        )}
                        {user.phoneVerified && (
                          <Badge variant="outline" className="text-xs">Phone</Badge>
                        )}
                        {!user.emailVerified && !user.phoneVerified && (
                          <span className="text-muted-foreground text-xs">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={user.accountStatus === 'active' ? 'destructive' : 'outline'}
                        onClick={() => handleToggleStatus(user.userId, user.accountStatus)}
                        className="gap-1"
                        disabled={user.accountStatus === 'suspended'}
                      >
                        {user.accountStatus === 'active' ? (
                          <>
                            <Lock className="h-3.5 w-3.5" />
                            Freeze
                          </>
                        ) : (
                          <>
                            <Unlock className="h-3.5 w-3.5" />
                            Unfreeze
                          </>
                        )}
                      </Button>
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
