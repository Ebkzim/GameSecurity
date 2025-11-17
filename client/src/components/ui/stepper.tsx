import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {index > 0 && (
                <div
                  className={cn(
                    "h-[2px] flex-1 transition-colors",
                    index <= currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <div
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                  index < currentStep &&
                    "border-primary bg-primary text-primary-foreground",
                  index === currentStep &&
                    "border-primary bg-background text-primary",
                  index > currentStep && "border-border bg-background text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] flex-1 transition-colors",
                    index < currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
            <div className="mt-2 text-center">
              <p
                className={cn(
                  "text-xs font-medium transition-colors",
                  index === currentStep && "text-foreground",
                  index !== currentStep && "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
