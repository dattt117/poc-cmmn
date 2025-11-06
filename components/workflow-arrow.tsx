"use client"

import { ArrowRight } from "lucide-react"

export default function WorkflowArrow() {
  return (
    <div className="flex items-center px-4 md:px-6 relative group">
      {/* Animated line */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-border to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Arrow icon */}
      <div className="relative z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm group-hover:bg-primary/10 group-hover:border-primary/50 transition-all duration-300 group-hover:scale-110">
        <ArrowRight className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
      </div>
      
      {/* Animated pulse effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary/20 animate-ping"></div>
      </div>
    </div>
  )
}
