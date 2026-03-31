import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Zap, Lock } from "lucide-react";

const slides = [
  {
    icon: Shield,
    title: "Welcome to TrustBridge",
    description: "India's most secure digital payment platform with advanced fraud protection",
    color: "text-primary",
  },
  {
    icon: Clock,
    title: "60-Second KYC",
    description: "Get verified instantly and start transacting within a minute",
    color: "text-info",
  },
  {
    icon: Lock,
    title: "Real-time Fraud Protection",
    description: "Every transaction is monitored and protected by Nokia's advanced security",
    color: "text-success",
  },
  {
    icon: Zap,
    title: "Instant Loans",
    description: "Get approved for loans instantly with our AI-powered credit system",
    color: "text-warning",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/register");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip Button */}
      {currentSlide < slides.length - 1 && (
        <div className="absolute top-6 right-6 z-10">
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            Skip
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className={`mb-8 ${slide.color}`}>
          <Icon className="h-32 w-32" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-4">{slide.title}</h2>
        <p className="text-muted-foreground text-center text-lg max-w-md mb-12">
          {slide.description}
        </p>

        {/* Progress Dots */}
        <div className="flex gap-2 mb-12">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-primary w-8"
                  : "bg-muted w-2"
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full max-w-sm touch-target"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
