import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initiatePayment, getProfile } from "@/services";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: Form, 2: Checking, 3: Result
  const [recipient, setRecipient] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [checking, setChecking] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [simSwapBlocked, setSimSwapBlocked] = useState(false);
  const [deviceSwapBlocked, setDeviceSwapBlocked] = useState(false);

  // Check profile on mount to pre-block payments if sim/device swap is already detected
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profileRes: any = await getProfile().catch(() => null);
        const user = profileRes?.user || profileRes || null;
        const sim = Boolean(
          user?.simSwapDetection?.swapped ||
          user?.nokiaVerification?.nokiaResults?.simSwapDetection?.swapped
        );
        const device = Boolean(
          user?.deviceSwapDetection?.swapped ||
          user?.nokiaVerification?.nokiaResults?.deviceSwapDetection?.swapped
        );
        if (!mounted) return;
        setSimSwapBlocked(sim);
        setDeviceSwapBlocked(device);
      } catch (e) {
        console.debug('Profile pre-check failed', e);
      } finally {
        if (mounted) setProfileChecked(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
    
  if (!recipient || !receiverName || !amount) {
  toast({
  title: "Missing Information",
  description: "Please fill in all required fields",
  variant: "destructive",
  });
  return;
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
  toast({
  title: "Invalid Amount",
  description: "Please enter a valid amount",
  variant: "destructive",
  });
  return;
  }

  setStep(2);
  setChecking(true);

  try {
  // Pre-check profile for Nokia sim/device swap flags. If present, block transaction on frontend.
  try {
    const profileRes: any = await getProfile().catch(() => null);
    const user = profileRes?.user || profileRes || null;
    const simSwapped = Boolean(
      user?.simSwapDetection?.swapped ||
      user?.nokiaVerification?.nokiaResults?.simSwapDetection?.swapped ||
      user?.nokiaVerification?.nokaiResults?.simSwapDetection?.swapped
    );
    const deviceSwapped = Boolean(
      user?.deviceSwapDetection?.swapped ||
      user?.nokiaVerification?.nokiaResults?.deviceSwapDetection?.swapped ||
      user?.nokiaVerification?.nokaiResults?.deviceSwapDetection?.swapped
    );

    if (simSwapped || deviceSwapped) {
      setChecking(false);
      setStep(1);
      toast({
        title: "Payment Blocked",
        description: simSwapped
          ? "SIM swap detected on this account — transactions are blocked. Contact support."
          : "Device swap detected on this account — transactions are blocked. Contact support.",
        variant: "destructive",
      });
      return;
    }
  } catch (e) {
    // If profile check fails, continue to normal flow (we don't want to block due to check failure)
    console.debug("Profile sim/device-swap check failed", e);
  }
  // Call real payment API
  const response = await initiatePayment({
  receiverUPI: recipient,
  receiverName: receiverName,
  amount: amountNum,
  description: description || undefined,
  });
  if (response) {
    // `initiatePayment` returns response.data already (service normalizes Axios), call it `data`
    const data: any = response;
    // Normalize possible fraud check shapes
    const fraudCheck = data.fraudCheck || data.fraudCheckResult || {};
    const simSwappedResp = Boolean(
      data.simSwapped ||
      fraudCheck?.details?.simSwapDetection?.swapped ||
      fraudCheck?.nokiaResults?.simSwapDetection?.swapped
    );
    const deviceSwappedResp = Boolean(
      data.deviceSwapped ||
      fraudCheck?.details?.deviceSwapDetection?.swapped ||
      fraudCheck?.nokiaResults?.deviceSwapDetection?.swapped
    );

    const risk = fraudCheck?.riskScore || 0;
    setRiskScore(risk);

    const tr = { ...data, fraudCheckResult: fraudCheck, simSwapped: simSwappedResp, deviceSwapped: deviceSwappedResp };

    // If response indicates a sim/device swap, force a blocked state and show explicit message
    if (simSwappedResp || deviceSwappedResp) {
      tr.status = 'BLOCKED';
      setTransactionResult(tr);
      setChecking(false);
      setStep(3);
      toast({
        title: 'Transaction Blocked',
        description: 'SIM/device swap detected — you cannot pay. Contact your bank or support.',
        variant: 'destructive'
      });
      return;
    }

    if (data.success) {
      setTransactionResult(tr);
      setChecking(false);
      setStep(3);
      toast({ title: 'Payment Initiated', description: `Transaction ${tr.status}` });
    } else {
      throw new Error(data.message || 'Payment failed');
    }
  } else {
    throw new Error('Payment failed');
  }
  } catch (error: any) {
  setChecking(false);
  toast({
  title: "Payment Failed",
  description: error.message || "Something went wrong. Please try again.",
  variant: "destructive",
  });
  setStep(1); // Go back to form
  }
  };

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
          <h1 className="text-xl font-bold">Send Money</h1>
        </div>
      </div>

      <div className="p-6">
        {(simSwapBlocked || deviceSwapBlocked) && (
          <Card className="p-4 mb-4 border border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-danger mt-1" />
              <div>
                <p className="font-semibold">Payments are blocked</p>
                <p className="text-sm text-muted-foreground">
                  We detected suspicious activity on your account (SIM/device swap). For your safety, sending money is temporarily disabled. Please contact support.
                </p>
              </div>
            </div>
          </Card>
        )}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <div className="space-y-4">
                {/* Recipient */}
                <div className="space-y-2">
                <Label htmlFor="recipient">Recipient UPI ID</Label>
                <Input
                id="recipient"
                placeholder="name@upi"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                />
                </div>

                {/* Receiver Name */}
                <div className="space-y-2">
                <Label htmlFor="receiverName">Receiver Name</Label>
                <Input
                id="receiverName"
                placeholder="Enter receiver's name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                required
                />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold"
                />
                </div>

                {/* Description */}
                <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                id="description"
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                />
                </div>
              </div>
            </Card>

            {/* Security Info */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Protected Payment</p>
                  <p className="text-xs text-muted-foreground">
                    Every transaction is monitored in real-time by Nokia's fraud
                    detection system
                  </p>
                </div>
              </div>
            </Card>

            <Button type="submit" className="w-full touch-target" size="lg" disabled={checking || simSwapBlocked || deviceSwapBlocked}>
            {checking ? (
            <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
            </>
            ) : (
            simSwapBlocked || deviceSwapBlocked ? 'You cannot pay (SIM/Device swap detected)' : 'Continue to Security Check'
            )}
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-8">
              <div className="text-center space-y-4">
                <div className="relative w-24 h-24 mx-auto">
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
                      stroke="hsl(var(--primary))"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="251"
                      strokeDashoffset={checking ? "125" : "0"}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-primary animate-pulse" />
                </div>

                <h2 className="text-2xl font-bold">Security Check in Progress</h2>
                <p className="text-muted-foreground">
                  Analyzing transaction for fraud patterns...
                </p>

                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Recipient verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm animate-pulse">
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span>Checking transaction patterns...</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    <span>Verifying location...</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === 3 && transactionResult && (
        <div className="space-y-6 animate-fade-in">
        <Card className="p-8">
        <div className="text-center space-y-4">
        {transactionResult.status !== 'BLOCKED' && riskScore < 50 ? (
        <>
        <div className="text-success mb-4">
        <CheckCircle className="h-20 w-20 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-success">
        {transactionResult.status === 'APPROVED' ? 'Transaction Approved' : 'Transaction Pending'}
        </h2>
        <p className="text-muted-foreground">
        {transactionResult.status === 'APPROVED'
        ? 'Your payment has been processed successfully'
        : 'Your transaction is being processed'}
        </p>

        {/* Risk Meter */}
        <div className="py-6">
        <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90">
        <circle
        cx="64"
        cy="64"
        r="56"
        stroke="hsl(var(--muted))"
        strokeWidth="8"
        fill="none"
        />
        <circle
        cx="64"
        cy="64"
        r="56"
        stroke={riskScore < 30 ? "hsl(var(--success))" : riskScore < 50 ? "hsl(var(--warning))" : "hsl(var(--danger))"}
        strokeWidth="8"
        fill="none"
        strokeDasharray={`${(riskScore / 100) * 352} 352`}
        strokeLinecap="round"
        />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <p className={`text-3xl font-bold ${
        riskScore < 30 ? 'text-success' :
        riskScore < 50 ? 'text-warning' :
        'text-danger'
        }`}>{riskScore}</p>
        <p className="text-xs text-muted-foreground">Risk Score</p>
        </div>
        </div>
        </div>

        <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between">
        <span className="text-muted-foreground">Transaction ID:</span>
        <span className="font-medium text-xs">{transactionResult.transactionId}</span>
        </div>
        <div className="flex justify-between">
        <span className="text-muted-foreground">Recipient:</span>
        <span className="font-medium">{recipient}</span>
        </div>
        <div className="flex justify-between">
        <span className="text-muted-foreground">Amount:</span>
        <span className="font-medium">₹{amount}</span>
        </div>
        <div className="flex justify-between">
        <span className="text-muted-foreground">Status:</span>
        <span className={`font-medium ${
        transactionResult.status === 'APPROVED' ? 'text-success' : 'text-warning'
        }`}>{transactionResult.status}</span>
        </div>
        {transactionResult.fraudCheckResult && (
        <div className="flex justify-between">
        <span className="text-muted-foreground">Risk Level:</span>
        <span className={`font-medium ${
        transactionResult.fraudCheckResult.riskLevel === 'LOW' ? 'text-success' :
        transactionResult.fraudCheckResult.riskLevel === 'MEDIUM' ? 'text-warning' :
        'text-danger'
        }`}>{transactionResult.fraudCheckResult.riskLevel}</span>
        </div>
        )}
        </div>

        <div className="space-y-2">
        <Button
        onClick={() => {
        toast({
        title: "Success",
        description: "Payment processed successfully",
        });
        navigate("/dashboard");
        }}
        className="w-full touch-target"
        size="lg"
        >
        Done
        </Button>
        <Button
        onClick={() => {
        setStep(1);
        setRecipient("");
        setAmount("");
        setDescription("");
        setTransactionResult(null);
        }}
        variant="outline"
        className="w-full touch-target"
        size="lg"
        >
        Send Another Payment
        </Button>
        </div>
        </>
        ) : (
        <>
        { (transactionResult.simSwapped || transactionResult.deviceSwapped) ? (
          <Card className="p-6 border border-danger/30 bg-danger/5">
            <div className="text-center">
              <div className="text-danger mb-4">
                <AlertTriangle className="h-20 w-20 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-danger">SIM/Device Swap Detected</h2>
              <p className="mt-2 text-muted-foreground">We detected a SIM or device swap on this account. For your safety, sending money is disabled. Please contact your bank or support immediately.</p>

              <div className="mt-6 space-y-2">
                <Button onClick={() => navigate('/security')} className="w-full touch-target" size="lg">
                  Contact Support
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full touch-target" size="lg">
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div className="text-danger mb-4">
              <AlertTriangle className="h-20 w-20 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-danger">
              {transactionResult.status === 'BLOCKED' ? 'Transaction Blocked' : 'High Risk Detected'}
            </h2>
            <p className="text-muted-foreground">
              This transaction has been flagged as potentially fraudulent
            </p>

            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-medium text-xs">{transactionResult.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risk Score:</span>
                <span className="font-bold text-danger">{riskScore}/100</span>
              </div>
              {transactionResult.fraudCheckResult?.riskFactors && (
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground mb-1">Risk Factors:</p>
                  <ul className="text-xs space-y-1">
                    {transactionResult.fraudCheckResult.riskFactors.slice(0, 3).map((factor: string, idx: number) => (
                      <li key={idx}>• {factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="w-full touch-target"
                size="lg"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => navigate("/security")}
                className="w-full touch-target"
                size="lg"
              >
                Contact Support
              </Button>
            </div>
          </>
        )}
        </>
        )}
        </div>
        </Card>
        </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
