import { create } from "zustand"

export type WorkflowStatus = "pending" | "approved" | "rejected"

export interface WorkflowStep {
  id: string
  name: string
  description: string
  status: WorkflowStatus
}

interface WorkflowState {
  steps: WorkflowStep[]
  currentStepIndex: number
  approveStep: (id: string) => void
  rejectStep: (id: string) => void
  insertStep: () => void
  removeNextStep: () => void
  resetWorkflow: () => void
}

const initialSteps: WorkflowStep[] = [
  {
    id: "1",
    name: "Initial Review",
    description: "Review the submitted request and verify all required information is present.",
    status: "pending",
  },
  {
    id: "2",
    name: "Technical Assessment",
    description: "Evaluate technical feasibility and resource requirements for the request.",
    status: "pending",
  },
  {
    id: "3",
    name: "Budget Approval",
    description: "Review and approve the budget allocation for the proposed project.",
    status: "pending",
  },
  {
    id: "4",
    name: "Final Sign-off",
    description: "Obtain final approval from stakeholders before proceeding with implementation.",
    status: "pending",
  },
]

export const useWorkflowStore = create<WorkflowState>((set) => ({
  steps: initialSteps,
  currentStepIndex: 0,

  approveStep: (id) =>
    set((state) => {
      const stepIndex = state.steps.findIndex((s) => s.id === id)
      if (stepIndex === -1 || stepIndex !== state.currentStepIndex) return state

      const newSteps = [...state.steps]
      newSteps[stepIndex] = { ...newSteps[stepIndex], status: "approved" }

      return {
        steps: newSteps,
        currentStepIndex: Math.min(stepIndex + 1, state.steps.length - 1),
      }
    }),

  rejectStep: (id) =>
    set((state) => {
      const stepIndex = state.steps.findIndex((s) => s.id === id)
      if (stepIndex === -1 || stepIndex !== state.currentStepIndex) return state

      const newSteps = [...state.steps]
      newSteps[stepIndex] = { ...newSteps[stepIndex], status: "rejected" }

      return {
        steps: newSteps,
      }
    }),

  insertStep: () =>
    set((state) => {
      const newStep: WorkflowStep = {
        id: `step-${Date.now()}`,
        name: "New Step",
        description: "This is a newly inserted step in the workflow.",
        status: "pending",
      }

      const newSteps = [...state.steps]
      newSteps.splice(state.currentStepIndex + 1, 0, newStep)

      return { steps: newSteps }
    }),

  removeNextStep: () =>
    set((state) => {
      if (state.currentStepIndex >= state.steps.length - 1) return state

      const newSteps = [...state.steps]
      newSteps.splice(state.currentStepIndex + 1, 1)

      return { steps: newSteps }
    }),

  resetWorkflow: () =>
    set({
      steps: initialSteps.map((step) => ({ ...step, status: "pending" })),
      currentStepIndex: 0,
    }),
}))
