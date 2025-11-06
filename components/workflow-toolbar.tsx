"use client";

import { useWorkflowStore } from "@/lib/workflow-store";
import { Button } from "@/components/ui/button";
import { Settings2, Rocket } from "lucide-react";

export default function WorkflowToolbar() {
  const { steps } = useWorkflowStore();

  const totalSteps = steps.length;
  const approvedSteps = steps.filter((s) => s.status === "approved").length;
  const rejectedSteps = steps.filter((s) => s.status === "rejected").length;
  const pendingSteps = steps.filter((s) => s.status === "pending").length;

  const handleDeploy = () => {
    // TODO: Implement deploy logic
    console.log("Deploying workflow...", steps);
    alert("Deploy workflow functionality will be implemented here");
  };

  return (
    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-card/80 via-card/60 to-card/80 backdrop-blur-md border border-border/50 rounded-xl p-5 md:p-6 shadow-lg">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-xl opacity-50"></div>

      <div className="relative flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-lg text-foreground">
            Workflow Controls
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage and monitor your workflow diagram
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-muted-foreground">
              {approvedSteps} Approved
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">
              {rejectedSteps} Rejected
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
            <span className="text-muted-foreground">
              {pendingSteps} Pending
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-muted-foreground">{totalSteps} Total</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <Button
          onClick={handleDeploy}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Rocket className="h-4 w-4 mr-2" />
          Deploy
        </Button>
      </div>
    </div>
  );
}
