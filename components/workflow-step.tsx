"use client";

import { useState, useEffect } from "react";
import type { WorkflowStep as WorkflowStepType } from "@/lib/workflow-store";
import { useWorkflowStore } from "@/lib/workflow-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Check,
  X,
  Plus,
  Trash2,
  Circle,
  Save,
  Edit2,
  User,
  Calendar,
  Clock,
  FileText,
  Flag
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStepProps {
  step: WorkflowStepType;
  index: number;
  onMoveStart?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

// Danh sách users mẫu để select
const USERS = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    avatar: ""
  },
  { id: "2", name: "Trần Thị B", email: "tranthib@example.com", avatar: "" },
  { id: "3", name: "Lê Văn C", email: "levanc@example.com", avatar: "" },
  { id: "4", name: "Phạm Thị D", email: "phamthid@example.com", avatar: "" },
  { id: "5", name: "Hoàng Văn E", email: "hoangvane@example.com", avatar: "" }
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function WorkflowStep({
  step,
  index,
  onMoveStart,
  onDragStart,
  onDragEnd
}: WorkflowStepProps) {
  const {
    currentStepIndex,
    approveStep,
    rejectStep,
    insertStep,
    insertStepAt,
    removeStep,
    updateStep,
    saveStep,
    moveStep,
    moveStepTo,
    steps
  } = useWorkflowStore();
  const isCurrentStep = index === currentStepIndex;
  const isPastStep = index < currentStepIndex;
  const isAfterCurrent = index > currentStepIndex;
  const isDraft = step.status === "draft";
  const canEdit = isDraft || isAfterCurrent;

  const approverUser = USERS.find((u) => u.name === step.approver);
  const assigneeUser = USERS.find((u) => u.name === step.assignee);

  // Cho phép insert/remove step tiếp theo ở mọi step (không chỉ step đầu)
  // Chỉ cho phép khi có step tiếp theo
  const canInsert = isCurrentStep && currentStepIndex < steps.length - 1;
  const canRemoveNext = isCurrentStep && currentStepIndex < steps.length - 1;

  // Helper function to remove next step
  const handleRemoveNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStepId = steps[currentStepIndex + 1].id;
      removeStep(nextStepId);
    }
  };

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Edit state for draft steps
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(step.name);
  const [editDescription, setEditDescription] = useState(step.description);
  const [editApprover, setEditApprover] = useState(step.approver || "");
  const [editAssignee, setEditAssignee] = useState(step.assignee || "");
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(
    step.dueDate ? new Date(step.dueDate) : undefined
  );
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">(
    step.priority || "medium"
  );
  const [editNotes, setEditNotes] = useState(step.notes || "");

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!canEdit) {
      e.preventDefault();
      return false;
    }
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", step.id);
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ stepId: step.id })
    );
    // Call parent callback
    onDragStart?.();
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
    return true;
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    // Call parent callback
    onDragEnd?.();
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  // Sync edit state when step changes
  useEffect(() => {
    setEditName(step.name);
    setEditDescription(step.description);
    setEditApprover(step.approver || "");
    setEditAssignee(step.assignee || "");
    setEditDueDate(step.dueDate ? new Date(step.dueDate) : undefined);
    setEditPriority(step.priority || "medium");
    setEditNotes(step.notes || "");
  }, [
    step.name,
    step.description,
    step.approver,
    step.assignee,
    step.dueDate,
    step.priority,
    step.notes
  ]);

  const handleSaveEdit = () => {
    if (canEdit) {
      updateStep(step.id, {
        name: editName,
        description: editDescription,
        approver: editApprover || undefined,
        assignee: editAssignee || undefined,
        dueDate: editDueDate ? editDueDate.toISOString() : undefined,
        priority: editPriority,
        notes: editNotes || undefined
      });
      setIsEditing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getPriorityColor = (priority?: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const handleSaveStep = () => {
    saveStep(step.id);
  };

  const getStatusColor = () => {
    switch (step.status) {
      case "approved":
        return "border-emerald-500/50 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/20 shadow-emerald-500/20";
      case "rejected":
        return "border-red-500/50 bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-950/30 dark:to-red-900/20 shadow-red-500/20";
      case "draft":
        // Draft: màu amber, design giống steps sau current
        return "border-amber-500/50 bg-gradient-to-br from-amber-100/70 to-amber-50/70 dark:from-amber-900/50 dark:to-amber-950/50 shadow-lg shadow-amber-500/25 ring-1 ring-amber-500/30";
      default:
        // Pending steps: current step giữ màu xanh như cũ
        if (isCurrentStep) {
          return "border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 dark:from-primary/20 dark:via-primary/10 dark:to-primary/20 shadow-primary/20";
        } else if (isAfterCurrent) {
          // Steps sau current: màu purple/violet, design giống draft
          return "border-purple-500/50 bg-gradient-to-br from-purple-100/70 to-purple-50/70 dark:from-purple-900/50 dark:to-purple-950/50 shadow-lg shadow-purple-500/25 ring-1 ring-purple-500/30";
        } else {
          return "border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm";
        }
    }
  };

  const getStatusBadge = () => {
    switch (step.status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-sm">
            <Check className="h-3.5 w-3.5" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold shadow-sm">
            <X className="h-3.5 w-3.5" />
            Rejected
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/90 to-amber-600/90 backdrop-blur-sm border-2 border-amber-500 text-white text-xs font-bold shadow-md">
            <Edit2 className="h-3.5 w-3.5" />
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-muted to-muted/80 backdrop-blur-sm border border-border/50 text-muted-foreground text-xs font-semibold">
            <Circle className="h-3 w-3 fill-current" />
            Pending
          </span>
        );
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 group",
        // Đảm bảo chiều cao container đồng nhất cho draft và steps sau current
        (isDraft || isAfterCurrent) && "min-h-[460px]"
      )}
    >
      {/* Step Number Badge */}
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-lg transition-all duration-300",
          step.status === "approved" &&
            "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
          step.status === "rejected" &&
            "bg-gradient-to-br from-red-500 to-red-600 text-white",
          step.status === "draft" &&
            "bg-gradient-to-br from-amber-500 to-amber-600 text-white",
          step.status === "pending" &&
            isCurrentStep &&
            "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/30",
          step.status === "pending" &&
            !isCurrentStep &&
            !isAfterCurrent &&
            "bg-muted text-muted-foreground opacity-50",
          step.status === "pending" &&
            !isCurrentStep &&
            isAfterCurrent &&
            "bg-gradient-to-br from-purple-500 to-purple-600 text-white border-2 border-purple-400/50"
        )}
      >
        {index + 1}
      </div>

      <div
        draggable={canEdit}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          "relative w-full max-w-xs md:w-80 lg:w-[340px] rounded-xl p-4 transition-all duration-300 flex flex-col",
          // Draft steps có border-dashed để phân biệt
          isDraft ? "border-2 border-dashed" : "border-2",
          getStatusColor(),
          isCurrentStep &&
            "shadow-2xl ring-2 ring-primary/30 hover:scale-[1.02] hover:shadow-xl",
          // Chỉ disable các step không phải current, không phải past, không phải draft, và không phải sau current
          !isCurrentStep &&
            !isPastStep &&
            !isDraft &&
            !isAfterCurrent &&
            "opacity-50 cursor-not-allowed",
          isPastStep && "opacity-75",
          step.status === "approved" && "shadow-xl shadow-emerald-500/10",
          step.status === "rejected" && "shadow-xl shadow-red-500/10",
          (isDraft || isAfterCurrent) && "hover:scale-[1.02] hover:shadow-xl",
          // Đảm bảo chiều cao đồng nhất cho draft và steps sau current
          (isDraft || isAfterCurrent) && "min-h-[320px]",
          // Drag cursor và visual feedback
          canEdit && "cursor-move",
          isDragging && "opacity-50 scale-95"
        )}
      >
        {/* Subtle glow for current step */}
        {isCurrentStep && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-xl opacity-40 blur-md -z-10"></div>
        )}

        {isCurrentStep && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-semibold rounded-full shadow-lg">
            Current Step
          </div>
        )}

        {/* Draft indicator - badge ở góc trên bên trái */}
        {isDraft && (
          <div className="absolute -top-2 -left-2 px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold rounded-md shadow-lg rotate-[-5deg] z-10">
            NEW
          </div>
        )}

        <div className="relative space-y-3 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            {canEdit && isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 font-bold text-xl"
                placeholder="Step name"
              />
            ) : (
              <h3 className="font-bold text-foreground text-xl leading-tight">
                {step.name}
              </h3>
            )}
            {getStatusBadge()}
          </div>

          {canEdit && isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="text-sm"
                placeholder="Step description"
                rows={3}
              />
              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Người duyệt
                  </label>
                  <Select value={editApprover} onValueChange={setEditApprover}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn người duyệt" />
                    </SelectTrigger>
                    <SelectContent>
                      {USERS.map((user) => (
                        <SelectItem key={user.id} value={user.name}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 shrink-0">
                              {user.avatar ? (
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.name}
                                />
                              ) : null}
                              <AvatarFallback className="text-[10px] leading-none">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Người trình
                  </label>
                  <Select value={editAssignee} onValueChange={setEditAssignee}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn người trình" />
                    </SelectTrigger>
                    <SelectContent>
                      {USERS.map((user) => (
                        <SelectItem key={user.id} value={user.name}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 shrink-0">
                              {user.avatar ? (
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.name}
                                />
                              ) : null}
                              <AvatarFallback className="text-[10px] leading-none">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-spans-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Thời hạn
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-sm",
                          !editDueDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {editDueDate ? (
                          editDueDate.toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={editDueDate}
                        onSelect={setEditDueDate}
                        initialFocus
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Độ ưu tiên
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) =>
                      setEditPriority(
                        e.target.value as "low" | "medium" | "high"
                      )
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Ghi chú
                </label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ghi chú bổ sung..."
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          )}

          {/* Thông tin chi tiết - hiển thị cho tất cả step (trừ khi draft đang edit) */}
          {!isEditing && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              {step.priority ? (
                <div className="flex items-center gap-2 text-xs">
                  <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Độ ưu tiên:</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded border text-xs font-medium",
                      getPriorityColor(step.priority)
                    )}
                  >
                    {step.priority === "high"
                      ? "Cao"
                      : step.priority === "medium"
                      ? "Trung bình"
                      : "Thấp"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Độ ưu tiên:</span>
                  <span className="text-muted-foreground/60 italic">
                    Chưa có
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground shrink-0">
                    Người duyệt:
                  </span>
                  {step.approver ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5 shrink-0">
                        {approverUser?.avatar ? (
                          <AvatarImage
                            src={approverUser.avatar}
                            alt={step.approver}
                          />
                        ) : null}
                        <AvatarFallback className="text-[10px] leading-none">
                          {getInitials(step.approver)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {step.approver}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/60 italic">
                      Chưa có
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground shrink-0">
                    Người trình:
                  </span>
                  {step.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5 shrink-0">
                        {assigneeUser?.avatar ? (
                          <AvatarImage
                            src={assigneeUser.avatar}
                            alt={step.assignee}
                          />
                        ) : null}
                        <AvatarFallback className="text-[10px] leading-none">
                          {getInitials(step.assignee)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {step.assignee}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/60 italic">
                      Chưa có
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground shrink-0">Tạo:</span>
                  {step.createdAt ? (
                    <span className="font-medium text-foreground truncate">
                      {formatDate(step.createdAt)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60 italic">
                      Chưa có
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground shrink-0">Hạn:</span>
                  {step.dueDate ? (
                    <span className="font-medium text-foreground truncate">
                      {formatDate(step.dueDate)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60 italic">
                      Chưa có
                    </span>
                  )}
                </div>
              </div>

              {step.approvedAt && (
                <div className="flex items-center gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-muted-foreground">Đã duyệt:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatDate(step.approvedAt)}
                  </span>
                </div>
              )}

              {step.rejectedAt && (
                <div className="flex items-center gap-2 text-xs">
                  <X className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-muted-foreground">Đã từ chối:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatDate(step.rejectedAt)}
                  </span>
                </div>
              )}

              {step.notes && (
                <div className="flex items-start gap-2 text-xs pt-1">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <span className="text-muted-foreground">Ghi chú: </span>
                    <span className="text-foreground">{step.notes}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Draft step actions and steps after current */}
          {canEdit && (
            <div className="flex flex-col gap-2 pt-2 mt-auto">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    Save Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(step.name);
                      setEditDescription(step.description);
                      setEditApprover(step.approver || "");
                      setEditAssignee(step.assignee || "");
                      setEditDueDate(
                        step.dueDate ? new Date(step.dueDate) : undefined
                      );
                      setEditPriority(step.priority || "medium");
                      setEditNotes(step.notes || "");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Row 1: Edit and Save Step */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                    >
                      <Edit2 className="h-4 w-4 mr-1.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    {isDraft ? (
                      <Button
                        size="sm"
                        onClick={handleSaveStep}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Save className="h-4 w-4 mr-1.5" />
                        <span className="hidden sm:inline">Save Step</span>
                      </Button>
                    ) : (
                      // Placeholder button để giữ chiều cao đồng nhất cho steps sau current step
                      <Button
                        size="sm"
                        disabled
                        className="w-full opacity-0 pointer-events-none"
                        aria-hidden="true"
                      >
                        <Save className="h-4 w-4 mr-1.5" />
                        <span className="hidden sm:inline">Save Step</span>
                      </Button>
                    )}
                  </div>
                  {/* Row 2: Delete button (for draft and steps after current) */}
                  <div className="w-full flex gap-2">
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeStep(step.id)}
                        className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden md:inline ml-1.5">Delete</span>
                      </Button>
                    )}
                    {/* Row 3: Insert button (for draft and steps after current) */}
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => insertStepAt(step.id, "after")}
                        className="flex-1 text-xs"
                        title="Insert Step"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        <span className="hidden sm:inline">Insert Step</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step.status === "pending" && isCurrentStep && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => approveStep(step.id)}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Check className="h-4 w-4 mr-1.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => rejectStep(step.id)}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <X className="h-4 w-4 mr-1.5" />
                Reject
              </Button>
            </div>
          )}
          {step.status === "pending" && !isCurrentStep && (
            <div className="pt-2">
              <p className="text-xs text-center text-muted-foreground italic">
                Chờ đến lượt của step này
              </p>
            </div>
          )}
          {step.status === "draft" && !isEditing && (
            <div className="pt-2">
              <p className="text-xs text-center text-amber-600 dark:text-amber-400 font-medium italic">
                Step mới - Vui lòng cấu hình và lưu
              </p>
            </div>
          )}
        </div>

        {/* Action buttons for current step - inside card at bottom */}
        {isCurrentStep && (
          <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {canInsert || canRemoveNext ? (
              <div className="flex gap-2">
                {canInsert && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={insertStep}
                    className="flex-1 text-xs bg-background/80 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Insert Step
                  </Button>
                )}
                {canRemoveNext && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveNext}
                    className="flex-1 text-xs text-destructive hover:text-destructive bg-background/80 backdrop-blur-sm border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-200"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Remove Next
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground italic">
                Đã đến step cuối cùng
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
