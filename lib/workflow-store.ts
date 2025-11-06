import { create } from "zustand";

export type WorkflowStatus = "pending" | "approved" | "rejected" | "draft";

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  approver?: string; // Người duyệt
  assignee?: string; // Người được giao
  createdAt?: string; // Ngày tạo
  dueDate?: string; // Thời hạn
  approvedAt?: string; // Ngày duyệt
  rejectedAt?: string; // Ngày từ chối
  notes?: string; // Ghi chú
  priority?: "low" | "medium" | "high"; // Độ ưu tiên
}

interface WorkflowState {
  steps: WorkflowStep[];
  currentStepIndex: number;
  approveStep: (id: string, approver?: string) => void;
  rejectStep: (id: string, reason?: string) => void;
  insertStep: () => void;
  insertStepAt: (stepId: string, position: "before" | "after") => void;
  removeStep: (id: string) => void;
  updateStep: (
    id: string,
    updates: Partial<Omit<WorkflowStep, "id" | "status">>
  ) => void;
  saveStep: (id: string) => void;
  moveStep: (id: string, direction: "up" | "down") => void;
  moveStepTo: (stepId: string, targetIndex: number) => void;
  swapSteps: (stepId1: string, stepId2: string) => void;
  resetWorkflow: () => void;
}

const initialSteps: WorkflowStep[] = [
  {
    id: "1",
    name: "Initial Review",
    description:
      "Review the submitted request and verify all required information is present.",
    status: "pending",
    priority: "high",
    approver: "Nguyễn Văn A",
    assignee: "Trần Thị B",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 ngày trước
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 ngày sau
  },
  {
    id: "2",
    name: "Technical Assessment",
    description:
      "Evaluate technical feasibility and resource requirements for the request.",
    status: "pending",
    priority: "medium",
    approver: "Lê Văn C",
    assignee: "Phạm Thị D",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 ngày trước
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 ngày sau
  },
  {
    id: "3",
    name: "Budget Approval",
    description:
      "Review and approve the budget allocation for the proposed project.",
    status: "pending",
    priority: "high",
    approver: "Hoàng Văn E",
    assignee: "Nguyễn Văn A",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 ngày trước
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 ngày sau
  },
  {
    id: "4",
    name: "Final Sign-off",
    description:
      "Obtain final approval from stakeholders before proceeding with implementation.",
    status: "pending",
    priority: "low",
    approver: "Trần Thị B",
    assignee: "Lê Văn C",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 ngày trước
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 ngày sau
  }
];

export const useWorkflowStore = create<WorkflowState>((set) => ({
  steps: initialSteps,
  currentStepIndex: 0,

  approveStep: (id, approver?: string) =>
    set((state) => {
      const stepIndex = state.steps.findIndex((s) => s.id === id);
      if (stepIndex === -1 || stepIndex !== state.currentStepIndex)
        return state;

      const newSteps = [...state.steps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        status: "approved",
        approvedAt: new Date().toISOString(),
        approver: approver || newSteps[stepIndex].approver
      };

      // Tự động chuyển sang step tiếp theo nếu chưa phải step cuối cùng
      const nextStepIndex = stepIndex + 1;
      const canMoveNext = nextStepIndex < state.steps.length;

      return {
        steps: newSteps,
        currentStepIndex: canMoveNext ? nextStepIndex : state.currentStepIndex
      };
    }),

  rejectStep: (id, reason?: string) =>
    set((state) => {
      const stepIndex = state.steps.findIndex((s) => s.id === id);
      if (stepIndex === -1 || stepIndex !== state.currentStepIndex)
        return state;

      const newSteps = [...state.steps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        status: "rejected",
        rejectedAt: new Date().toISOString(),
        notes: reason || newSteps[stepIndex].notes
      };

      return {
        steps: newSteps
        // Khi reject, không chuyển sang step tiếp theo
      };
    }),

  insertStep: () =>
    set((state) => {
      // Cho phép insert step tiếp theo ở mọi step
      // Không cho phép nếu đã là step cuối cùng
      if (state.currentStepIndex >= state.steps.length - 1) return state;

      const newStep: WorkflowStep = {
        id: `step-${Date.now()}-${Math.random()}`,
        name: "New Step",
        description: "This is a newly inserted step in the workflow.",
        status: "draft", // Step mới có status là draft
        createdAt: new Date().toISOString(),
        priority: "medium"
      };

      const newSteps = [...state.steps];
      newSteps.splice(state.currentStepIndex + 1, 0, newStep);

      return { steps: newSteps };
    }),

  insertStepAt: (stepId: string, position: "before" | "after") =>
    set((state) => {
      const stepIndex = state.steps.findIndex((s) => s.id === stepId);
      if (stepIndex === -1) return state;

      const step = state.steps[stepIndex];
      // Chỉ cho phép insert từ draft steps hoặc steps sau current step
      const isDraft = step.status === "draft";
      const isAfterCurrent = stepIndex > state.currentStepIndex;

      if (!isDraft && !isAfterCurrent) return state;

      const newStep: WorkflowStep = {
        id: `step-${Date.now()}-${Math.random()}`,
        name: "New Step",
        description: "This is a newly inserted step in the workflow.",
        status: "draft",
        createdAt: new Date().toISOString(),
        priority: "medium"
      };

      const newSteps = [...state.steps];
      const insertIndex = position === "before" ? stepIndex : stepIndex + 1;
      newSteps.splice(insertIndex, 0, newStep);

      // Điều chỉnh currentStepIndex nếu insert step trước current step
      let newCurrentStepIndex = state.currentStepIndex;
      if (position === "before" && stepIndex <= state.currentStepIndex) {
        newCurrentStepIndex = state.currentStepIndex + 1;
      }

      return {
        steps: newSteps,
        currentStepIndex: newCurrentStepIndex
      };
    }),

  removeStep: (id: string) =>
    set((state) => {
      const stepIndex = state.steps.findIndex((s) => s.id === id);
      if (stepIndex === -1) return state;

      const step = state.steps[stepIndex];
      // Cho phép xóa step draft hoặc step sau current step
      const isDraft = step.status === "draft";
      const isAfterCurrent = stepIndex > state.currentStepIndex;

      // Không cho phép xóa step đã được approve hoặc reject
      const isApprovedOrRejected =
        step.status === "approved" || step.status === "rejected";

      if ((!isDraft && !isAfterCurrent) || isApprovedOrRejected) return state;

      const newSteps = state.steps.filter((s) => s.id !== id);

      // Nếu xóa step trước currentStepIndex, cần điều chỉnh currentStepIndex
      let newCurrentStepIndex = state.currentStepIndex;
      if (stepIndex < state.currentStepIndex) {
        newCurrentStepIndex = state.currentStepIndex - 1;
      }

      return {
        steps: newSteps,
        currentStepIndex: newCurrentStepIndex
      };
    }),

  updateStep: (
    id: string,
    updates: Partial<Omit<WorkflowStep, "id" | "status">>
  ) =>
    set((state) => {
      const stepIndex = state.steps.findIndex((s) => s.id === id);
      if (stepIndex === -1) return state;

      const step = state.steps[stepIndex];
      // Cho phép update step draft hoặc step sau current step
      const isDraft = step.status === "draft";
      const isAfterCurrent = stepIndex > state.currentStepIndex;

      if (!isDraft && !isAfterCurrent) return state;

      const newSteps = [...state.steps];
      newSteps[stepIndex] = { ...newSteps[stepIndex], ...updates };

      return { steps: newSteps };
    }),

  saveStep: (id: string) =>
    set((state) => {
      const stepIndex = state.steps.findIndex((s) => s.id === id);
      if (stepIndex === -1) return state;

      // Chỉ cho phép save step draft
      if (state.steps[stepIndex].status !== "draft") return state;

      const newSteps = [...state.steps];
      newSteps[stepIndex] = { ...newSteps[stepIndex], status: "pending" };

      return { steps: newSteps };
    }),

  moveStep: (id: string, direction: "up" | "down") =>
    set((state) => {
      const stepIndex = state.steps.findIndex((s) => s.id === id);
      if (stepIndex === -1) return state;

      const step = state.steps[stepIndex];
      // Cho phép di chuyển step draft hoặc step sau current step
      const isDraft = step.status === "draft";
      const isAfterCurrent = stepIndex > state.currentStepIndex;

      if (!isDraft && !isAfterCurrent) return state;

      const newSteps = [...state.steps];
      const targetIndex = direction === "up" ? stepIndex - 1 : stepIndex + 1;

      // Kiểm tra bounds
      if (targetIndex < 0 || targetIndex >= newSteps.length) return state;

      // Không cho phép di chuyển qua current step
      if (targetIndex === state.currentStepIndex) return state;

      // Không cho phép di chuyển các step đã được approve/reject
      const targetStep = newSteps[targetIndex];
      const targetIsDraft = targetStep.status === "draft";
      const targetIsAfterCurrent = targetIndex > state.currentStepIndex;

      // Chỉ cho phép hoán đổi với step có thể edit được (draft hoặc sau current step)
      const canMove = targetIsDraft || targetIsAfterCurrent;

      if (!canMove) return state;

      // Swap steps
      [newSteps[stepIndex], newSteps[targetIndex]] = [
        newSteps[targetIndex],
        newSteps[stepIndex]
      ];

      return { steps: newSteps };
    }),

  moveStepTo: (stepId: string, targetIndex: number) =>
    set((state) => {
      const stepIndex = state.steps.findIndex((s) => s.id === stepId);
      if (stepIndex === -1) return state;

      const step = state.steps[stepIndex];
      // Cho phép di chuyển step draft hoặc step sau current step
      const isDraft = step.status === "draft";
      const isAfterCurrent = stepIndex > state.currentStepIndex;

      if (!isDraft && !isAfterCurrent) return state;

      // Kiểm tra bounds - cho phép targetIndex = steps.length (drop sau step cuối)
      if (targetIndex < 0 || targetIndex > state.steps.length) return state;
      if (targetIndex === stepIndex) return state;

      // Tính toán targetIndex sau khi remove step (nếu cần)
      let adjustedTargetIndex = targetIndex;
      if (stepIndex < targetIndex) {
        adjustedTargetIndex = targetIndex - 1;
      }

      // Không cho phép di chuyển qua current step
      // Nếu step đang ở sau current và muốn di chuyển về trước current
      if (
        stepIndex > state.currentStepIndex &&
        adjustedTargetIndex <= state.currentStepIndex
      ) {
        return state;
      }
      // Nếu step đang ở trước current và muốn di chuyển qua current
      if (
        stepIndex < state.currentStepIndex &&
        adjustedTargetIndex >= state.currentStepIndex
      ) {
        return state;
      }

      // Kiểm tra xem có thể drop vào vị trí này không
      // Chỉ cho phép drop vào vùng có các step có thể edit (draft hoặc sau current)
      // Hoặc drop vào cuối danh sách
      if (adjustedTargetIndex < state.steps.length) {
        const targetStep = state.steps[adjustedTargetIndex];
        const targetIsDraft = targetStep.status === "draft";
        const targetIsAfterCurrent =
          adjustedTargetIndex > state.currentStepIndex;
        const canMoveTo = targetIsDraft || targetIsAfterCurrent;

        if (!canMoveTo) return state;
      }

      // Di chuyển step đến vị trí mới
      const newSteps = [...state.steps];
      const [movedStep] = newSteps.splice(stepIndex, 1);
      newSteps.splice(adjustedTargetIndex, 0, movedStep);

      return { steps: newSteps };
    }),

  swapSteps: (stepId1: string, stepId2: string) =>
    set((state) => {
      const stepIndex1 = state.steps.findIndex((s) => s.id === stepId1);
      const stepIndex2 = state.steps.findIndex((s) => s.id === stepId2);

      if (stepIndex1 === -1 || stepIndex2 === -1) return state;
      if (stepIndex1 === stepIndex2) return state;

      const step1 = state.steps[stepIndex1];
      const step2 = state.steps[stepIndex2];

      // Chỉ cho phép swap step draft hoặc step sau current step
      const step1IsDraft = step1.status === "draft";
      const step1IsAfterCurrent = stepIndex1 > state.currentStepIndex;
      const step2IsDraft = step2.status === "draft";
      const step2IsAfterCurrent = stepIndex2 > state.currentStepIndex;

      if (
        (!step1IsDraft && !step1IsAfterCurrent) ||
        (!step2IsDraft && !step2IsAfterCurrent)
      ) {
        return state;
      }

      // Không cho phép swap qua current step
      if (
        (stepIndex1 < state.currentStepIndex &&
          stepIndex2 >= state.currentStepIndex) ||
        (stepIndex1 > state.currentStepIndex &&
          stepIndex2 <= state.currentStepIndex)
      ) {
        return state;
      }

      // Swap 2 steps
      const newSteps = [...state.steps];
      [newSteps[stepIndex1], newSteps[stepIndex2]] = [
        newSteps[stepIndex2],
        newSteps[stepIndex1]
      ];

      return { steps: newSteps };
    }),

  resetWorkflow: () =>
    set({
      steps: initialSteps.map((step) => ({ ...step, status: "pending" })),
      currentStepIndex: 0
    })
}));
