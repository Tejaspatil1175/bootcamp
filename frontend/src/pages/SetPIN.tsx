import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const SetPIN = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  const getPinStrength = () => {
    const pinString = pin.join("");
    if (pinString.length < 4) return { text: "", color: "" };

    // Check for sequential or repetitive
    if (/0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210/.test(pinString)) {
      return { text: "Weak", color: "text-danger" };
    }
    if (/(\d)\1{3}/.test(pinString)) {
      return { text: "Weak", color: "text-danger" };
    }

    const uniqueDigits = new Set(pinString).size;
    if (uniqueDigits === 4) return { text: "Strong", color: "text-success" };
    if (uniqueDigits === 3) return { text: "Medium", color: "text-warning" };
    return { text: "Weak", color: "text-danger" };
  };

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (value.length > 1) return;
    
    const refs = isConfirm ? confirmRefs : pinRefs;
    const setter = isConfirm ? setConfirmPin : setPin;
    const current = isConfirm ? confirmPin : pin;
    
    const newPin = [...current];
    newPin[index] = value;
    setter(newPin);

    if (value && index < 3) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    const refs = isConfirm ? confirmRefs : pinRefs;
    const current = isConfirm ? confirmPin : pin;
    
    if (e.key === "Backspace" && !current[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const pinString = pin.join("");
    const confirmString = confirmPin.join("");

    if (pinString.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN",
        variant: "destructive",
      });
      return;
    }

    const strength = getPinStrength();
    if (strength.text === "Weak") {
      toast({
        title: "Weak PIN",
        description: "Please choose a stronger PIN (avoid sequential or repetitive numbers)",
        variant: "destructive",
      });
      return;
    }

    if (pinString !== confirmString) {
      toast({
        title: "PINs Don't Match",
        description: "Please make sure both PINs are the same",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("authToken", "demo-token-123");
      localStorage.setItem("userPhone", localStorage.getItem("registrationPhone") || "");
      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
      });
      navigate("/kyc");
    }, 1000);
  };

  const strength = getPinStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/30 to-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Security Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-background">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Create Your Secure PIN</h1>
            <p className="text-muted-foreground">Your 4-digit PIN protects your account and transactions</p>
          </div>
          <div className="security-badge mx-auto w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Bank-Grade Encryption</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="professional-card p-8 space-y-6">
          {/* Create PIN */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Enter PIN</Label>
            <div className="flex gap-3 justify-center">
              {pin.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (pinRefs.current[index] = el)}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-16 h-16 text-center text-2xl font-bold border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              ))}
            </div>
          </div>

          {/* Re-enter PIN */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Confirm PIN</Label>
            <div className="flex gap-3 justify-center">
              {confirmPin.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (confirmRefs.current[index] = el)}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value, true)}
                  onKeyDown={(e) => handleKeyDown(index, e, true)}
                  className="w-16 h-16 text-center text-2xl font-bold border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              ))}
            </div>
          </div>

          {/* PIN Strength */}
          {strength.text && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">PIN Strength</span>
                <span className={`text-sm font-bold ${strength.color}`}>
                  {strength.text}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      i === 0 && strength.text
                        ? strength.color === "text-success"
                          ? "bg-success shadow-sm"
                          : strength.color === "text-warning"
                          ? "bg-warning shadow-sm"
                          : "bg-danger shadow-sm"
                        : i === 1 && (strength.text === "Medium" || strength.text === "Strong")
                        ? strength.color === "text-success"
                          ? "bg-success shadow-sm"
                          : "bg-warning shadow-sm"
                        : i === 2 && strength.text === "Strong"
                        ? "bg-success shadow-sm"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Security Tips */}
          <div className="bg-info/5 border border-info/20 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-info flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-info/90 space-y-1">
                <p className="font-semibold">Security Tips:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Avoid sequential numbers (1234, 4321)</li>
                  <li>Don't use repeated digits (1111, 2222)</li>
                  <li>Never share your PIN with anyone</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Create Account Button */}
          <Button
            onClick={handleSubmit}
            className="w-full touch-target gradient-primary font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Securing Your Account...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Create Secure Account
              </>
            )}
          </Button>
        </div>

        {/* Footer Trust Indicator */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your data is encrypted and never shared</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPIN;
