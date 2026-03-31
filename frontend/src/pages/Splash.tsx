import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    const authToken = localStorage.getItem("authToken");

    const timer = setTimeout(() => {
      if (authToken) {
        navigate("/dashboard");
      } else if (hasSeenOnboarding) {
        navigate("/login");
      } else {
        navigate("/onboarding");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen gradient-primary flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-center animate-scale-in">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-white/20 p-6 backdrop-blur-sm">
            <Shield className="h-20 w-20 text-white" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">TrustBridge</h1>
        <p className="text-white/90 text-lg font-medium">
          Securing India's Digital Payments
        </p>
      </div>
    </div>
  );
};

export default Splash;
