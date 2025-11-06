"use client"

import { useWorkflowStore } from "@/lib/workflow-store"
import { Button } from "@/components/ui/button"
import { RotateCcw, Download } from "lucide-react"

export default function WorkflowToolbar() {
  const { resetWorkflow, steps } = useWorkflowStore()

  const handleExport = () => {
    const dataStr = JSON.stringify(steps, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "workflow.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
      <div>
        <h2 className="font-semibold text-foreground">Workflow Controls</h2>
        <p className="text-sm text-muted-foreground">Manage your workflow diagram</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={resetWorkflow}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  )
}
