import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Send, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTransactionHistory } from "@/services";
import { useToast } from "@/hooks/use-toast";

const Transactions = () => {
const navigate = useNavigate();
const { toast } = useToast();
const [loading, setLoading] = useState(true);
const [transactions, setTransactions] = useState<any[]>([]);
const [refreshing, setRefreshing] = useState(false);

useEffect(() => {
const fetchTransactions = async () => {
try {
setLoading(true);

// Fetch transaction history
const historyRes: any = await getTransactionHistory({ limit: 20 });
// `getTransactionHistory` may return several shapes; normalize to an array
// - an array
// - { success: true, data: { transactions: [...] } }
// - { transactions: [...] } or { data: [...] }
const rawTxns = Array.isArray(historyRes)
  ? historyRes
  : historyRes?.data?.transactions || historyRes?.transactions || (Array.isArray(historyRes?.data) ? historyRes.data : historyRes?.data) || [];
console.debug('Transactions API response:', historyRes);
console.debug('Parsed rawTxns:', rawTxns);
const formattedTxns = Array.isArray(rawTxns) ? rawTxns.map((txn: any) => {
const isReceived = txn.type === 'CREDIT' || txn.status === 'APPROVED';
const riskScore = txn.fraudCheckResult?.riskScore || 0;
            
return {
id: txn.transactionId,
name: txn.description || txn.recipientUpiId || 'Transaction',
amount: isReceived ? txn.amount : -txn.amount,
time: new Date(txn.createdAt).toLocaleTimeString('en-US', {
hour: '2-digit',
minute: '2-digit'
}),
date: new Date(txn.createdAt).toLocaleDateString(),
status: txn.status.toLowerCase(),
riskScore: Math.round(riskScore),
};
}) : [];
setTransactions(formattedTxns);

} catch (error: any) {
toast({
title: "Error",
description: error.message || "Failed to load transactions",
variant: "destructive",
});
} finally {
setLoading(false);
}
};

fetchTransactions();
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
          <h1 className="text-xl font-bold">Transactions</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Transaction List */}
        <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <div>
            <Button size="sm" variant="ghost" onClick={async () => {
              setRefreshing(true);
              try {
                const historyRes: any = await getTransactionHistory({ limit: 20 });
                const rawTxns = Array.isArray(historyRes)
                  ? historyRes
                  : historyRes?.data?.transactions || historyRes?.transactions || (Array.isArray(historyRes?.data) ? historyRes.data : historyRes?.data) || [];
                const formattedTxns = rawTxns.map((txn: any) => ({
                  id: txn.transactionId,
                  name: txn.description || txn.recipientUpiId || 'Transaction',
                  amount: (txn.type === 'CREDIT' || txn.status === 'APPROVED') ? txn.amount : -txn.amount,
                  time: new Date(txn.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                  date: new Date(txn.createdAt).toLocaleDateString(),
                  status: txn.status?.toLowerCase() || txn.status,
                  riskScore: Math.round(txn.fraudCheckResult?.riskScore || 0)
                }));
                setTransactions(formattedTxns);
              } catch (e) {
                // ignore
              } finally { setRefreshing(false); }
            }}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No transactions yet</p>
          </Card>
        ) : (
          transactions.map((txn) => (
            <Card key={txn.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      txn.amount > 0 ? "bg-success/10" : "bg-primary/10"
                    }`}
                  >
                    {txn.amount > 0 ? (
                      <TrendingUp className="h-6 w-6 text-success" />
                    ) : (
                      <Send className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{txn.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {txn.date} • {txn.time}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {txn.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-lg ${
                      txn.amount > 0 ? "text-success" : "text-foreground"
                    }`}
                  >
                    {txn.amount > 0 ? "+" : ""}₹{Math.abs(txn.amount)}
                  </p>
                </div>
              </div>

              {/* Risk Score */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <Shield className={`h-4 w-4 ${
                  txn.riskScore < 10 ? "text-success" : 
                  txn.riskScore < 50 ? "text-warning" : "text-danger"
                }`} />
                <span className="text-sm text-muted-foreground">Risk Score:</span>
                <span className={`text-sm font-semibold ${
                  txn.riskScore < 10 ? "text-success" : 
                  txn.riskScore < 50 ? "text-warning" : "text-danger"
                }`}>
                  {txn.riskScore}/100
                </span>
                <Badge
                  variant="outline"
                  className={`ml-auto ${
                    txn.riskScore < 10 ? "border-success text-success" : 
                    txn.riskScore < 50 ? "border-warning text-warning" : "border-danger text-danger"
                  }`}
                >
                  {txn.riskScore < 10 ? "Safe" : txn.riskScore < 50 ? "Medium" : "High Risk"}
                </Badge>
              </div>
            </Card>
          ))
        )}
              </div>
              </div>
              </div>
              );
              };

export default Transactions;
