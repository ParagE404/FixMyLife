import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  X, 
  ArrowRight, 
  Lightbulb, 
  Zap, 
  PenTool, 
  Mic,
  CheckCircle
} from 'lucide-react';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Smart Activity Logging! 🎉',
    description: 'We\'ve made logging activities much easier. Let us show you around!',
    icon: Lightbulb,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'quick',
    title: 'Quick Entry - Fastest Way',
    description: 'Tap any button to instantly log common activities. Perfect for busy moments!',
    icon: Zap,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'smart',
    title: 'Smart Suggestions - AI Powered',
    description: 'Get personalized suggestions based on your patterns and the time of day.',
    icon: Lightbulb,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'text',
    title: 'Text Input - Multiple Activities',
    description: 'Describe multiple activities at once: "Worked 9-12, lunch 12:30, gym 6-7pm"',
    icon: PenTool,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'voice',
    title: 'Voice Input - Hands Free',
    description: 'Just speak naturally about your activities. Great when you\'re on the go!',
    icon: Mic,
    color: 'bg-pink-100 text-pink-600'
  }
];

export function ActivityOnboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('activity-onboarding-seen');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('activity-onboarding-seen', 'true');
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs">
              {currentStep + 1} of {onboardingSteps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mx-auto`}>
              <IconComponent className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip Tour
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-1 justify-center mt-6">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}