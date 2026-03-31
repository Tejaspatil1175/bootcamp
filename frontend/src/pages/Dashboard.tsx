import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getProfile, getUserKYC, getTransactionHistory } from "@/services";
import {
  Send,
  Wallet,
  CreditCard,
  Receipt,
  ShieldCheck,
  Smartphone,
  MapPin,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Home,
  History,
  User,
  Zap,
  IndianRupee,
} from "lucide-react";

const Dashboard = () => {
const navigate = useNavigate();
const [loading, setLoading] = useState(true);
const [userName, setUserName] = useState("User");
const [securityScore, setSecurityScore] = useState(75);
const [kycData, setKycData] = useState<any>(null);
const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

const quickActions = [
{ icon: Send, label: "Send", path: "/payment", gradient: "from-blue-500 to-blue-600" },
{ icon: Receipt, label: "Receive", path: "/payment", gradient: "from-green-500 to-green-600" },
{ icon: CreditCard, label: "Loan", path: "/loan", gradient: "from-purple-500 to-purple-600" },
{ icon: Wallet, label: "Wallet", path: "/transactions", gradient: "from-orange-500 to-orange-600" },
];

// Fetch user data on component mount
useEffect(() => {
const fetchDashboardData = async () => {
try {
setLoading(true);

// Fetch user profile
const profileRes = await getProfile();
if (profileRes.success && profileRes.data) {
setUserName(profileRes.data.name || "Tejas patil");
}

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

// Fetch recent transactions
try {
const transactionsRes = await getTransactionHistory({ limit: 3 });
if (transactionsRes.success && transactionsRes.data) {
const formattedTransactions = transactionsRes.data.map((txn: any) => {
const isReceived = txn.type === 'CREDIT' || txn.status === 'APPROVED';
const riskLevel = txn.fraudCheckResult?.riskLevel || 'LOW';
              
return {
name: txn.description || txn.recipientUpiId || 'Transaction',
amount: txn.amount,
type: isReceived ? "received" : "sent",
date: new Date(txn.createdAt).toLocaleDateString(),
risk: riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase(),
};
});
setRecentTransactions(formattedTransactions);
}
} catch (txnError) {
console.log("Transaction history not available");
// Keep default transactions as fallback
setRecentTransactions([
{ name: "Amazon", amount: 1249, type: "sent", date: "Today", risk: "Low" },
{ name: "Swiggy", amount: 458, type: "sent", date: "Yesterday", risk: "Low" },
{ name: "Salary Credit", amount: 45000, type: "received", date: "2 days ago", risk: "Low" },
]);
}

} catch (error) {
console.error("Error fetching dashboard data:", error);
} finally {
setLoading(false);
}
};

fetchDashboardData();
}, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-br from-[#2563EB] via-[#1E40AF] to-[#1E3A8A] text-white px-5 pt-5 pb-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/70 text-xs mb-0.5">Hello,</p>
              <h1 className="text-xl font-bold">{userName}</h1>
            </div>
            <button 
              onClick={() => navigate("/profile")}
              className="relative group"
            >
              <Avatar className="h-10 w-10 border-2 border-white/20 group-hover:border-white/40 transition-all">
                <AvatarFallback className="bg-white/15 text-white font-semibold text-sm backdrop-blur-sm">
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-[#2563EB]" />
            </button>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center group-hover:-translate-y-0.5`}>
                  <action.icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-medium text-white/90 group-hover:text-white">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-14 space-y-3.5">
        {/* Security Score Card */}
        <Card className="p-4 card-shadow border-0 bg-white hover:card-shadow-hover transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Security Score</h3>
              <p className="text-xs text-gray-500">Your account is secure</p>
            </div>
            <button 
              onClick={() => navigate("/security")}
              className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition-all active:scale-95"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Circular Progress */}
            <div className="relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="none"
                  className="text-gray-100"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="url(#gradient)"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - securityScore / 100)}`}
                  className="transition-all duration-1000"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{securityScore}</div>
                  <div className="text-[9px] text-gray-500 font-medium">Great</div>
                </div>
              </div>
            </div>

            {/* Status Items */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900">Fraud Protection</p>
                  <p className="text-[10px] text-green-600 font-medium">Active</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                  <Smartphone className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900">Device Verified</p>
                  <p className="text-[10px] text-blue-600 font-medium">Trusted</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Loan Offer Banner */}
        <Card className="p-5 bg-gradient-to-br from-[#2563EB] via-[#1E40AF] to-[#1E3A8A] text-white border-0 card-shadow overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/15 rounded-full mb-1.5">
                  <Zap className="h-3 w-3 text-yellow-300" />
                  <span className="text-[10px] font-semibold text-white">Pre-approved</span>
                </div>
                <h3 className="text-2xl font-bold mb-0.5">₹1,00,000</h3>
                <p className="text-white/70 text-xs">@ 12% p.a.</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <Button 
              onClick={() => navigate("/loan")}
              className="w-full bg-white text-[#2563EB] hover:bg-white/95 font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98] h-9 text-sm"
            >
              Apply Now
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        </Card>

        {/* Protection Status */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2.5 text-sm">Protection Status</h3>
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3 text-center border-0 card-shadow hover:card-shadow-hover transition-all bg-white">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-medium text-gray-500 mb-0.5">SIM Security</p>
              <p className="text-xs font-bold text-green-600">Active</p>
            </Card>
            
            <Card className="p-3 text-center border-0 card-shadow hover:card-shadow-hover transition-all bg-white">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                <Smartphone className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-medium text-gray-500 mb-0.5">Device</p>
              <p className="text-xs font-bold text-blue-600">Verified</p>
            </Card>
            
            <Card className="p-3 text-center border-0 card-shadow hover:card-shadow-hover transition-all bg-white">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-medium text-gray-500 mb-0.5">Location</p>
              <p className="text-xs font-bold text-purple-600">Safe</p>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-semibold text-gray-900 text-sm">Recent Activity</h3>
            <button 
              onClick={() => navigate("/transactions")}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 hover:gap-1 transition-all"
            >
              See All
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <div className="space-y-2">
            {recentTransactions.map((txn, index) => (
              <Card 
                key={index}
                className="p-3 border-0 card-shadow hover:card-shadow-hover transition-all cursor-pointer active:scale-[0.99] bg-white"
                onClick={() => navigate("/transactions")}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shadow-sm ${
                    txn.type === "sent" 
                      ? "bg-gradient-to-br from-red-400 to-red-500" 
                      : "bg-gradient-to-br from-green-400 to-green-500"
                  }`}>
                    {txn.type === "sent" ? (
                      <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-white" strokeWidth={2.5} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm">{txn.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[10px] text-gray-500">{txn.date}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold bg-green-50 text-green-700">
                        {txn.risk} Risk
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      txn.type === "sent" ? "text-red-600" : "text-green-600"
                    }`}>
                      {txn.type === "sent" ? "-" : "+"}₹{txn.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-5 py-1.5 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center gap-0.5 text-blue-600 relative group">
            <div className="p-1.5 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <Home className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-semibold">Home</span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
          </button>
          <button 
            onClick={() => navigate("/transactions")}
            className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-blue-600 transition-colors group"
          >
            <div className="p-1.5 rounded-xl group-hover:bg-blue-50 transition-colors">
              <History className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="text-[9px] font-medium">Activity</span>
          </button>
          <button 
            onClick={() => navigate("/loan")}
            className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-blue-600 transition-colors group"
          >
            <div className="p-1.5 rounded-xl group-hover:bg-blue-50 transition-colors">
              <Wallet className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="text-[9px] font-medium">Loans</span>
          </button>
          <button 
            onClick={() => navigate("/security")}
            className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-blue-600 transition-colors group"
          >
            <div className="p-1.5 rounded-xl group-hover:bg-blue-50 transition-colors">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="text-[9px] font-medium">Security</span>
          </button>
          <button 
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-blue-600 transition-colors group"
          >
            <div className="p-1.5 rounded-xl group-hover:bg-blue-50 transition-colors">
              <User className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="text-[9px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
