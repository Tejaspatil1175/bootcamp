import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Fingerprint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/services";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
    
  if (!email || !password) {
  toast({
  title: "Missing Fields",
  description: "Please enter both email and password",
  variant: "destructive",
  });
  return;
  }

  if (password.length < 8) {
  toast({
  title: "Invalid Password",
  description: "Password must be at least 8 characters",
  variant: "destructive",
  });
  return;
  }

  setLoading(true);
    
  try {
  const response = await login({ email, password });
      
  if (response.success) {
  toast({
  title: "Login Successful",
  description: `Welcome back, ${response.user?.name || 'User'}!`,
  });
  navigate("/dashboard");
  } else {
  toast({
  title: "Login Failed",
  description: response.message || "Invalid credentials",
  variant: "destructive",
  });
  }
  } catch (error: any) {
  toast({
  title: "Login Error",
  description: error.message || "Something went wrong. Please try again.",
  variant: "destructive",
  });
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

        <h1 className="text-3xl font-bold mb-2">Welcome Back! 👋</h1>
        <p className="text-muted-foreground mb-2">Login to your account</p>
        
        {/* Test Credentials Info */}
        <div className="mb-6 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground max-w-sm">
        <p className="font-semibold mb-1">Test Account:</p>
        <p>Email: t2@gmail.com</p>
        <p>Password: 12345678</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
        {/* Email */}
        <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
        id="email"
        type="email"
        placeholder="user@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
        required
        />
        </div>

        {/* Password */}
        <div className="space-y-2">
        <div className="flex items-center justify-between">
        <Label htmlFor="password">Password</Label>
        <Link to="/forgot-pin" className="text-sm text-primary hover:underline">
        Forgot Password?
        </Link>
        </div>
        <Input
        id="password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
        />
        </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full touch-target"
            size="lg"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* Biometric Option */}
          <Button
            type="button"
            variant="outline"
            className="w-full touch-target"
            size="lg"
          >
            <Fingerprint className="mr-2 h-5 w-5" />
            Use Biometric
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-8 text-muted-foreground">
          New user?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
