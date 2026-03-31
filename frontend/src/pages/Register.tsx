import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { register } from "@/services/authService";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
    
  if (!formData.name.trim()) {
  toast({
  title: "Name Required",
  description: "Please enter your full name",
  variant: "destructive",
  });
  return;
  }

  if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
  toast({
  title: "Invalid Email",
  description: "Please enter a valid email address",
  variant: "destructive",
  });
  return;
  }
    
  if (formData.phone.length !== 10) {
  toast({
  title: "Invalid Phone",
  description: "Please enter a valid 10-digit phone number",
  variant: "destructive",
  });
  return;
  }

  if (!formData.phone.startsWith("6") && !formData.phone.startsWith("7") && !formData.phone.startsWith("8") && !formData.phone.startsWith("9")) {
  toast({
  title: "Invalid Phone",
  description: "Indian mobile numbers start with 6, 7, 8, or 9",
  variant: "destructive",
  });
  return;
  }

  if (!formData.password || formData.password.length < 8) {
  toast({
  title: "Invalid Password",
  description: "Password must be at least 8 characters long",
  variant: "destructive",
  });
  return;
  }

  if (formData.password !== formData.confirmPassword) {
  toast({
  title: "Passwords Don't Match",
  description: "Please make sure your passwords match",
  variant: "destructive",
  });
  return;
  }

  if (!termsAccepted) {
  toast({
  title: "Terms Required",
  description: "Please accept the Terms & Privacy Policy",
  variant: "destructive",
  });
  return;
  }

  setLoading(true);
    
  try {
  // Call registration API with Nokia KYC integration
  const response = await register({
  name: formData.name,
  email: formData.email,
  phone: formData.phone,
  password: formData.password,
  });

  if (response.success) {
  toast({
  title: "Registration Successful",
  description: "Performing KYC verification...",
  });

  // Store KYC ID for status tracking
  if (response.kycStatus?.kycId) {
  localStorage.setItem("kycId", response.kycStatus.kycId);
  }

  // Navigate to KYC page to show verification status
  navigate("/kyc");
  }
  } catch (error: any) {
  toast({
  title: "Registration Failed",
  description: error.message || "Please try again later",
  variant: "destructive",
  });
  console.error("Registration error:", error);
  } finally {
  setLoading(false);
  }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Shield className="h-16 w-16 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Welcome! 👋</h1>
        <p className="text-muted-foreground mb-8">Let's get you started</p>

        {/* Form */}
        <form onSubmit={handleRegister} className="w-full max-w-sm space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="flex gap-2">
          <div className="flex items-center justify-center px-3 bg-muted rounded-md border">
          <span className="text-sm font-medium">+9</span>
          </div>
          <Input
          id="phone"
          type="tel"
          placeholder="98765 43210"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          className="flex-1"
          maxLength={10}
          />
          </div>
          <p className="text-xs text-muted-foreground">
          We'll send you an OTP to verify your number
          </p>
          </div>

          {/* Password */}
          <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          minLength={8}
          />
          <p className="text-xs text-muted-foreground">
          Minimum 8 characters
          </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          minLength={8}
          />
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
            >
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Continue Button */}
          <Button
          type="submit"
          className="w-full touch-target"
          size="lg"
          disabled={loading}
          >
          {loading ? (
          <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Account...
          </>
          ) : (
          "Continue"
          )}
          </Button>
        </form>

        {/* Login Link */}
        <p className="mt-8 text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
