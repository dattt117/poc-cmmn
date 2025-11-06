"use client"

import { useWorkflowStore } from "@/lib/workflow-store"
import WorkflowStep from "./workflow-step"
import WorkflowArrow from "./workflow-arrow"
import WorkflowToolbar from "./workflow-toolbar"

export default function WorkflowDiagram() {
  const steps = useWorkflowStore((state) => state.steps)

  return (
    <div className="space-y-6">
      <WorkflowToolbar />

      <div className="bg-card border border-border rounded-lg p-8 overflow-x-auto">
        <div className="flex items-center gap-4 min-w-max">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <WorkflowStep step={step} index={index} />
              {index < steps.length - 1 && <WorkflowArrow />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
