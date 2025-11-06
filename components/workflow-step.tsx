"use client"

import type { WorkflowStep as WorkflowStepType } from "@/lib/workflow-store"
import { useWorkflowStore } from "@/lib/workflow-store"
import { Button } from "@/components/ui/button"
import { Check, X, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkflowStepProps {
  step: WorkflowStepType
  index: number
}

export default function WorkflowStep({ step, index }: WorkflowStepProps) {
  const { currentStepIndex, approveStep, rejectStep, insertStep, removeNextStep, steps } = useWorkflowStore()
  const isCurrentStep = index === currentStepIndex
  const canInsert = isCurrentStep && index < steps.length - 1
  const canRemoveNext = isCurrentStep && index < steps.length - 1

  const getStatusColor = () => {
    switch (step.status) {
      case "approved":
        return "border-emerald-500 bg-emerald-500/10"
      case "rejected":
        return "border-red-500 bg-red-500/10"
      default:
        return isCurrentStep ? "border-blue-500 bg-blue-500/10" : "border-border bg-card"
    }
  }

  const getStatusBadge = () => {
    switch (step.status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <Check className="h-3 w-3" />
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            <X className="h-3 w-3" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
            Pending
          </span>
        )
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          "relative w-72 border-2 rounded-lg p-4 transition-all duration-200",
          getStatusColor(),
          isCurrentStep && "shadow-lg ring-2 ring-blue-500/20",
        )}
      >
        {isCurrentStep && (
          <div className="absolute -top-3 left-4 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
            Current Step
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-lg">{step.name}</h3>
            {getStatusBadge()}
          </div>

          <p className="text-sm text-muted-foreground">{step.description}</p>

          {step.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => approveStep(step.id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => rejectStep(step.id)} className="flex-1">
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons for current step */}
      {isCurrentStep && (
        <div className="flex gap-2">
          {canInsert && (
            <Button size="sm" variant="outline" onClick={insertStep} className="text-xs bg-transparent">
              <Plus className="h-3 w-3 mr-1" />
              Insert Step
            </Button>
          )}
          {canRemoveNext && (
            <Button
              size="sm"
              variant="outline"
              onClick={removeNextStep}
              className="text-xs text-destructive hover:text-destructive bg-transparent"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remove Next
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
