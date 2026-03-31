import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Phone, Smartphone, MapPin, FileText, AlertCircle, Loader2, XCircle } from "lucide-react";
import { getKYCStatus } from "@/services/kycService";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, name: "Phone", icon: Phone, description: "Number Verification" },
  { id: 2, name: "SIM", icon: Smartphone, description: "SIM Swap Check" },
  { id: 3, name: "Device", icon: Smartphone, description: "Device Swap Check" },
  { id: 4, name: "Location", icon: MapPin, description: "Location Verification" },
];

const KYC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [kycData, setKycData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 20; // 20 retries * 2 seconds = 40 seconds max wait

  useEffect(() => {
    const kycId = localStorage.getItem("kycId");
    
    if (!kycId) {
      toast({
        title: "No KYC Found",
        description: "Please register first",
        variant: "destructive",
      });
      navigate("/register");
      return;
    }

    // Poll KYC status every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await getKYCStatus(kycId);
        setKycData(response);

        // Update progress based on status
        if (response.status === 'COMPLETED' || response.status === 'FLAGGED') {
          setLoading(false);
          setProgress(100);
          setCurrentStep(4);
          clearInterval(pollInterval);
          
          // Show completion message after 2 seconds
          setTimeout(() => {
            if (response.status === 'FLAGGED') {
              toast({
                title: "KYC Flagged",
                description: "Your account has been flagged for manual review",
                variant: "destructive",
              });
            } else {
              toast({
                title: "KYC Completed",
                description: "Verification successful! Redirecting...",
              });
            }
            navigate("/dashboard");
          }, 2000);
        } else if (response.status === 'FAILED') {
          setLoading(false);
          setError("KYC verification failed. Please contact support.");
          clearInterval(pollInterval);
        } else if (response.status === 'IN_PROGRESS') {
          // Update progress gradually
          const stepProgress = Math.min(currentStep + 1, 3);
          setCurrentStep(stepProgress);
          setProgress((stepProgress / 4) * 100);
        }

        setRetryCount((prev) => prev + 1);
        
        // Timeout after max retries
        if (retryCount >= maxRetries) {
          clearInterval(pollInterval);
          setLoading(false);
          setError("Verification is taking longer than expected. Please try again later.");
        }
      } catch (err: any) {
        console.error("Error fetching KYC status:", err);
        setRetryCount((prev) => prev + 1);
        
        if (retryCount >= maxRetries) {
          clearInterval(pollInterval);
          setLoading(false);
          setError("Failed to fetch KYC status. Please try again later.");
        }
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [navigate, toast, retryCount]);

  const getRiskLevelColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'VERY_LOW':
      case 'LOW':
        return 'text-green-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'HIGH':
        return 'text-orange-600';
      case 'CRITICAL':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">KYC Verification</h1>
        <p className="text-muted-foreground">
          {loading ? "Verifying your identity with Nokia NAC..." : "Verification Complete"}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {Math.round(progress)}% Complete
        </p>
      </div>

      {/* Steps */}
      <div className="flex justify-between mb-12">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : isActive && loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <p className="text-xs font-medium text-center">{step.name}</p>
              <p className="text-xs text-muted-foreground text-center">{step.description}</p>
            </div>
          );
        })}
      </div>

      {/* Status Content */}
      <Card className="p-6 mb-6 flex-1">
        {loading ? (
          <div className="text-center space-y-4 animate-fade-in">
            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
            <h2 className="text-xl font-bold">Verifying...</h2>
            <p className="text-muted-foreground">
              Running comprehensive Nokia NAC fraud checks
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 justify-center">
                {currentStep >= 0 && <Check className="h-4 w-4 text-green-500" />}
                <span>Checking phone number verification...</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                {currentStep >= 1 ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                )}
                <span>Detecting SIM swap activity...</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                {currentStep >= 2 ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent" />
                )}
                <span>Checking device swap history...</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                {currentStep >= 3 ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent" />
                )}
                <span>Verifying location...</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center space-y-4 animate-fade-in">
            <XCircle className="h-16 w-16 mx-auto text-red-500" />
            <h2 className="text-xl font-bold text-red-600">Verification Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate("/register")} variant="outline">
              Try Again
            </Button>
          </div>
        ) : kycData?.nokiaVerification ? (
          <div className="space-y-6 animate-fade-in">
            {/* Risk Score */}
            <div className="text-center">
              <div className="mb-4">
                {kycData.status === 'FLAGGED' ? (
                  <AlertCircle className="h-16 w-16 mx-auto text-orange-500" />
                ) : (
                  <Check className="h-16 w-16 mx-auto text-green-500" />
                )}
              </div>
              <h2 className="text-xl font-bold mb-2">
                {kycData.status === 'FLAGGED' ? 'Account Flagged' : 'Verification Complete'}
              </h2>
              <div className={`text-3xl font-bold mb-2 ${getRiskLevelColor(kycData.nokiaVerification.riskLevel)}`}>
                Risk Score: {kycData.nokiaVerification.riskScore}/100
              </div>
              <div className="text-lg font-medium text-muted-foreground mb-4">
                Level: {kycData.nokiaVerification.riskLevel}
              </div>
              <div className="inline-block px-4 py-2 rounded-full bg-muted">
                <span className="font-medium">
                  Recommendation: {kycData.nokiaVerification.recommendation}
                </span>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Verification Details:</h3>
              <div className="space-y-2 text-sm">
                {kycData.nokiaVerification.riskFactors?.map((factor: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div className="text-center text-sm text-muted-foreground">
              Verification Confidence: {(kycData.nokiaVerification.confidence * 100).toFixed(0)}%
            </div>

            {kycData.status === 'FLAGGED' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  ⚠️ Your account has been flagged for manual review. Our team will verify your details and contact you within 24-48 hours.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Check className="h-16 w-16 mx-auto text-green-500" />
            <h2 className="text-xl font-bold">Verification Complete</h2>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        )}
      </Card>

      {/* Navigation Button */}
      {!loading && !error && (
        <Button onClick={() => navigate("/dashboard")} className="w-full touch-target">
          Continue to Dashboard
        </Button>
      )}
    </div>
  );
};

export default KYC;
