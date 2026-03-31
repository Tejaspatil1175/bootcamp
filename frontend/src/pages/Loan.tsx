import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitLoanApplication, getUserApplications } from "@/services";

const Loan = () => {
const navigate = useNavigate();
const { toast } = useToast();
const [amount, setAmount] = useState("");
const [purpose, setPurpose] = useState("");
const [employmentType, setEmploymentType] = useState("Salaried");
const [monthlyIncome, setMonthlyIncome] = useState("");
const [step, setStep] = useState(1); // 1: Form, 2: Checking, 3: Approved/Rejected
const [applicationResult, setApplicationResult] = useState<any>(null);
const [submitting, setSubmitting] = useState(false);
const [appLoading, setAppLoading] = useState(false);
const [applicationsList, setApplicationsList] = useState<any[]>([]);

const calculateEMI = () => {
const loanAmount = parseInt(amount) || 0;
const monthlyInterest = 0.01; // 12% annual = 1% monthly
const months = 12;
const emi = (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, months)) /
(Math.pow(1 + monthlyInterest, months) - 1);
return Math.round(emi);
};

const handleApply = async () => {
if (!amount || parseInt(amount) < 5000) {
toast({
title: "Invalid Amount",
description: "Minimum loan amount is ₹5,000",
variant: "destructive",
});
return;
}

if (!monthlyIncome || parseInt(monthlyIncome) < 10000) {
toast({
title: "Invalid Income",
description: "Please enter a valid monthly income",
variant: "destructive",
});
return;
}

try {
setSubmitting(true);
setStep(2);

    // Submit loan application with required personal fields and simulator coordinates
    const response = await submitLoanApplication({
      loanAmount: parseInt(amount),
      loanPurpose: purpose || "Home renovation",
      employmentType: employmentType,
      monthlyIncome: parseInt(monthlyIncome),
      // Provide additional personal fields expected by backend. These are defaults; you can extend the form later.
      fullName: "Test User",
      phoneNumber: "+99999991001",
      email: "t2@gmail.com",
      dateOfBirth: "1990-01-01",
      address: {
        street: "123 Test Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        latitude: 19.160422047462603,
        longitude: 47.44178899529922
      }
    } as any);

if (response.success) {
setApplicationResult(response.data);
setStep(3);
toast({
title: "Application Submitted",
description: "Your loan application has been submitted successfully",
});
}
} catch (error: any) {
toast({
title: "Application Failed",
description: error.message || "Failed to submit application",
variant: "destructive",
});
setStep(1);
} finally {
setSubmitting(false);
}
};

useEffect(() => {
  let mounted = true;
  const loadApplications = async () => {
    try {
      setAppLoading(true);
      const res: any = await getUserApplications();
      // normalize: API returns { success:true, count, applications }
      const items = Array.isArray(res) ? res : res?.applications || res?.data?.applications || [];
      if (mounted) setApplicationsList(items);
    } catch (e) {
      // ignore
    } finally {
      if (mounted) setAppLoading(false);
    }
  };
  loadApplications();
  return () => { mounted = false; };
}, []);

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-xl font-bold">Instant Loan</h1>
        </div>
      </div>

      <div className="p-6">
        {/* User's past applications */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Your Applications</h2>
            <Button size="sm" variant="ghost" onClick={async () => {
              setAppLoading(true);
              try {
                const r: any = await getUserApplications();
                const items = Array.isArray(r) ? r : r?.applications || r?.data?.applications || [];
                setApplicationsList(items);
              } catch (e) {
              } finally { setAppLoading(false); }
            }}>
              {appLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
          {applicationsList.length === 0 ? (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">No applications yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {applicationsList.map((app: any) => (
                <Card key={app.applicationId || app._id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{app.applicationId}</div>
                      <div className="text-sm text-muted-foreground">₹{app.loanAmount} • {new Date(app.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${app.status === 'approved' || app.status === 'APPROVED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {app.status}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Loan Amount */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Loan Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-2xl font-bold"
                  />
                  <p className="text-sm text-muted-foreground">
                    Min: ₹5,000 • Max: ₹2,00,000
                  </p>
                </div>

                <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                id="purpose"
                placeholder="e.g., Home renovation, Education, Medical"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <select
                id="employmentType"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business">Business Owner</option>
                <option value="Freelancer">Freelancer</option>
                </select>
                </div>

                <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                <Input
                id="monthlyIncome"
                type="number"
                placeholder="50000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                />
                </div>
                </div>
            </Card>

            {/* EMI Calculator */}
            {amount && parseInt(amount) >= 5000 && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold mb-3">Loan Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loan Amount:</span>
                    <span className="font-bold">₹{parseInt(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate:</span>
                    <span className="font-medium">12% per annum</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tenure:</span>
                    <span className="font-medium">12 months</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Monthly EMI:</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{calculateEMI().toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            <Button
            onClick={handleApply}
            className="w-full touch-target"
            size="lg"
            disabled={submitting}
            >
            {submitting ? (
            <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting...
            </>
            ) : (
            "Apply for Loan"
            )}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-8">
              <div className="text-center space-y-4">
                <CreditCard className="h-20 w-20 mx-auto text-primary animate-pulse" />
                <h2 className="text-2xl font-bold">Checking Eligibility</h2>
                <p className="text-muted-foreground">
                  Verifying your credit score and eligibility...
                </p>
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Identity verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm animate-pulse">
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span>Checking credit score...</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === 3 && applicationResult && (
        <div className="space-y-6 animate-fade-in">
        <Card className="p-8">
        <div className="text-center space-y-4">
        <div className={applicationResult.status === 'APPROVED' ? "text-success mb-4" : "text-warning mb-4"}>
        <CheckCircle className="h-24 w-24 mx-auto" />
        </div>
        <h2 className={`text-3xl font-bold ${applicationResult.status === 'APPROVED' ? 'text-success' : 'text-warning'}`}>
        {applicationResult.status === 'APPROVED' ? 'Application Submitted!' : 'Under Review'}
        </h2>
        <p className="text-muted-foreground">
        {applicationResult.status === 'APPROVED'
        ? 'Your loan application has been submitted and is being processed'
        : 'Your application is under review. We will notify you soon.'}
        </p>

        <Card className="bg-muted p-6 space-y-3">
        <div className="flex justify-between">
        <span className="text-muted-foreground">Application ID:</span>
        <span className="font-bold text-sm">{applicationResult.applicationId}</span>
        </div>
        <div className="flex justify-between">
        <span className="text-muted-foreground">Loan Amount:</span>
        <span className="font-bold text-lg">₹{parseInt(amount).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
        <span className="text-muted-foreground">Monthly EMI:</span>
        <span className="font-bold text-lg text-primary">
        ₹{calculateEMI().toLocaleString()}
        </span>
        </div>
        <div className="flex justify-between">
        <span className="text-muted-foreground">Status:</span>
        <span className="font-medium">{applicationResult.status}</span>
        </div>
        {applicationResult.fraudCheckResult && (
        <div className="flex justify-between">
        <span className="text-muted-foreground">Risk Score:</span>
        <span className={`font-bold ${
        applicationResult.fraudCheckResult.riskScore < 30 ? 'text-success' :
        applicationResult.fraudCheckResult.riskScore < 70 ? 'text-warning' :
        'text-danger'
        }`}>
        {applicationResult.fraudCheckResult.riskScore}/100
        </span>
        </div>
        )}
        </Card>

        <div className="pt-4 space-y-2">
        <Button
        onClick={() => navigate("/dashboard")}
        className="w-full touch-target"
        size="lg"
        >
        Back to Dashboard
        </Button>
        <Button
        onClick={() => {
        setStep(1);
        setAmount("");
        setPurpose("");
        setMonthlyIncome("");
        setApplicationResult(null);
        }}
        variant="outline"
        className="w-full touch-target"
        size="lg"
        >
        Apply for Another Loan
        </Button>
        </div>
        </div>
        </Card>
        </div>
        )}
      </div>
    </div>
  );
};

export default Loan;
