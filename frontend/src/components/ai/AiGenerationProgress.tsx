"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GenerationStep {
  id: string
  label: string
  status: "pending" | "in_progress" | "completed"
  count?: number
}

interface AiGenerationProgressProps {
  steps: GenerationStep[]
  currentProgress: number
  className?: string
}

export function AiGenerationProgress({ steps, currentProgress, className }: AiGenerationProgressProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Generating Test Cases</span>
          <span className="font-medium">{currentProgress}%</span>
        </div>
        <Progress value={currentProgress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {step.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : step.status === "in_progress" ? (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                step.status === "completed" ? "text-green-700 dark:text-green-400" :
                step.status === "in_progress" ? "text-blue-700 dark:text-blue-400" :
                "text-muted-foreground"
              )}>
                {step.label}
              </p>
              {step.count !== undefined && step.status === "in_progress" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Generated: {step.count} test cases
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
