import WorkflowDiagram from "@/components/workflow-diagram";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 md:p-8 lg:p-12">
      <div className="mx-auto ">
        {/* Hero Section */}
        <div className="mb-10 md:mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Workflow Management System
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Workflow Manager
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Manage and visualize your approval workflow with an intuitive,
            modern interface
          </p>
        </div>
        <WorkflowDiagram />
      </div>
    </main>
  );
}
