import WorkflowDiagram from "@/components/workflow-diagram"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Workflow Manager</h1>
          <p className="text-muted-foreground">Manage and visualize your approval workflow</p>
        </div>
        <WorkflowDiagram />
      </div>
    </main>
  )
}
