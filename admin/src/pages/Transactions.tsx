import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { transactionsAPI } from '@/api';
import type { Transaction } from '@/types/api';

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [reviewComments, setReviewComments] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getFlaggedTransactions({ page: 1, limit: 100 });
      setTransactions(response.transactions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load transactions';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (transaction: Transaction, decision: 'approved' | 'rejected') => {
    setSelectedTransaction(transaction);
    setReviewDecision(decision);
    setReviewComments('');
    setReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedTransaction) return;

    try {
      setReviewing(true);
      await transactionsAPI.reviewTransaction(selectedTransaction.transactionId, {
        decision: reviewDecision,
        comments: reviewComments || undefined,
      });

      toast.success(`Transaction ${reviewDecision} successfully`);
      setReviewDialog(false);
      setSelectedTransaction(null);
      
      // Refresh transactions list
      fetchTransactions();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to review transaction';
      toast.error(errorMessage);
    } finally {
      setReviewing(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.userId.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = 
      riskFilter === 'all' || 
      transaction.fraudCheck?.riskLevel === riskFilter;
    
    return matchesSearch && matchesRisk;
  });

  const riskColors = {
    HIGH: 'destructive',
    CRITICAL: 'destructive',
    MEDIUM: 'warning',
    LOW: 'secondary',
  } as const;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Flagged Transactions</h1>
        <p className="text-muted-foreground">
          Review and manage transactions flagged by the fraud detection system
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Pending Review ({filteredTransactions.length})</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 md:w-64"
                />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High Risk</SelectItem>
                  <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                  <SelectItem value="LOW">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No flagged transactions</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.transactionId}>
                    <TableCell className="font-medium">{transaction.transactionId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.userId.name}</p>
                        <p className="text-sm text-muted-foreground">{transaction.userId.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">₹{transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {transaction.fraudCheck?.riskLevel && (
                        <Badge variant={riskColors[transaction.fraudCheck.riskLevel]}>
                          {transaction.fraudCheck.riskLevel}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.status === 'completed' ? 'default' :
                        transaction.status === 'blocked' ? 'destructive' :
                        transaction.status === 'pending' ? 'warning' :
                        'secondary'
                      }>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {!transaction.adminReview && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewClick(transaction, 'approved')}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReviewClick(transaction, 'rejected')}
                            className="gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {transaction.adminReview && (
                        <Badge variant="outline">Reviewed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDecision === 'approved' ? 'Approve' : 'Reject'} Transaction
            </DialogTitle>
            <DialogDescription>
              {selectedTransaction && (
                <>
                  Transaction ID: <span className="font-mono">{selectedTransaction.transactionId}</span>
                  <br />
                  Amount: <span className="font-semibold">₹{selectedTransaction.amount.toLocaleString()}</span>
                  <br />
                  User: {selectedTransaction.userId.name} ({selectedTransaction.userId.email})
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Comments (Optional)</label>
              <Textarea
                placeholder="Add review notes or reason for decision..."
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            {selectedTransaction?.fraudCheck?.flags && selectedTransaction.fraudCheck.flags.length > 0 && (
              <div>
                <label className="text-sm font-medium">Fraud Flags:</label>
                <ul className="mt-2 space-y-1">
                  {selectedTransaction.fraudCheck.flags.map((flag, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialog(false)}
              disabled={reviewing}
            >
              Cancel
            </Button>
            <Button
              variant={reviewDecision === 'approved' ? 'default' : 'destructive'}
              onClick={handleSubmitReview}
              disabled={reviewing}
            >
              {reviewing ? 'Processing...' : `${reviewDecision === 'approved' ? 'Approve' : 'Reject'} Transaction`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
