"use client";

import React from "react";
import { useWorkflowStore } from "@/lib/workflow-store";
import WorkflowStep from "./workflow-step";
import WorkflowArrow from "./workflow-arrow";
import WorkflowToolbar from "./workflow-toolbar";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";

export default function WorkflowDiagram() {
  const steps = useWorkflowStore((state) => state.steps);
  const currentStepIndex = useWorkflowStore((state) => state.currentStepIndex);
  const moveStepTo = useWorkflowStore((state) => state.moveStepTo);
  const swapSteps = useWorkflowStore((state) => state.swapSteps);
  const previousStepIdsRef = useRef<Set<string>>(
    new Set(steps.map((s) => s.id))
  );
  const [newStepIds, setNewStepIds] = useState<Set<string>>(new Set());
  const [removingStepIds, setRemovingStepIds] = useState<Set<string>>(
    new Set()
  );
  const [movingStepIds, setMovingStepIds] = useState<Set<string>>(new Set());
  // Track các step đã animate để không animate lại
  const animatedStepIdsRef = useRef<Set<string>>(new Set());
  // Track step positions để smooth move animation
  const stepPositionsRef = useRef<Map<string, number>>(new Map());
  // Lưu step đang bị xóa để render animation
  const [removingSteps, setRemovingSteps] = useState<typeof steps>([]);
  // Lưu previous steps để có thể tìm step đang bị xóa
  const previousStepsRef = useRef<typeof steps>(steps);
  // Drag and drop state
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update step positions
  useEffect(() => {
    steps.forEach((step, index) => {
      stepPositionsRef.current.set(step.id, index);
    });
  }, [steps]);

  useEffect(() => {
    const currentStepIds = new Set(steps.map((s) => s.id));
    const newIds = new Set<string>();

    // Tìm step mới được thêm vào (chưa từng được animate)
    currentStepIds.forEach((id) => {
      if (
        !previousStepIdsRef.current.has(id) &&
        !animatedStepIdsRef.current.has(id)
      ) {
        newIds.add(id);
      }
    });

    // Tìm step bị xóa (có trong previous nhưng không có trong current)
    const deletedIds = new Set<string>();
    const deletedSteps: typeof steps = [];
    previousStepIdsRef.current.forEach((id) => {
      if (!currentStepIds.has(id)) {
        deletedIds.add(id);
        // Tìm step object từ previous steps để render animation
        const deletedStep = previousStepsRef.current.find((s) => s.id === id);
        if (deletedStep) {
          deletedSteps.push(deletedStep);
        }
      }
    });

    // Nếu có step mới, đánh dấu và trigger animation
    if (newIds.size > 0) {
      // Đánh dấu các step này đã được animate trước khi set state
      newIds.forEach((id) => animatedStepIdsRef.current.add(id));

      // Set state ngay để step được render với opacity 0
      setNewStepIds(newIds);

      // Sau khi animate xong (600ms), remove khỏi newStepIds
      setTimeout(() => {
        setNewStepIds((prev) => {
          const updated = new Set(prev);
          newIds.forEach((id) => {
            if (updated.has(id)) {
              updated.delete(id);
            }
          });
          return updated;
        });
      }, 600);
    }

    // Nếu có step bị xóa, trigger animation fade out trước
    if (deletedIds.size > 0) {
      // Lưu step đang bị xóa để render animation
      setRemovingSteps(deletedSteps);
      // Track step đang bị xóa để animate
      setRemovingStepIds(deletedIds);

      // Sau khi animation fade out hoàn thành (400ms), cleanup
      setTimeout(() => {
        setRemovingStepIds(new Set());
        setRemovingSteps([]);
        // Xóa khỏi animatedStepIdsRef sau khi đã animate out
        deletedIds.forEach((id) => animatedStepIdsRef.current.delete(id));
      }, 400);
    }

    // Cập nhật previousStepIdsRef và previousStepsRef SAU khi đã track deletedIds
    previousStepIdsRef.current = currentStepIds;
    previousStepsRef.current = steps;
  }, [steps]);

  // Trigger animation cho step mới sau khi DOM đã render
  useEffect(() => {
    if (newStepIds.size > 0) {
      // Sử dụng double requestAnimationFrame để đảm bảo DOM đã render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          newStepIds.forEach((id) => {
            const element = document.querySelector(
              `[data-step-id="${id}"]`
            ) as HTMLElement;
            if (element) {
              // Remove class để trigger animation
              element.classList.remove("step-new-initial");
            }
          });
        });
      });
    }
  }, [newStepIds]);

  // Track moving steps với smooth animation
  useEffect(() => {
    if (movingStepIds.size > 0) {
      // Reset moving state sau animation
      const timer = setTimeout(() => {
        setMovingStepIds(new Set());
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [movingStepIds]);

  // Auto-scroll khi drag gần edge của container
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      if (!draggedStepId || !scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollThreshold = 100; // Khoảng cách từ edge để trigger scroll
      const scrollSpeed = 10; // Tốc độ scroll

      // Clear previous interval
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }

      // Check if near left edge
      if (e.clientX - rect.left < scrollThreshold) {
        autoScrollIntervalRef.current = setInterval(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft -= scrollSpeed;
          }
        }, 16); // ~60fps
      }
      // Check if near right edge
      else if (rect.right - e.clientX < scrollThreshold) {
        autoScrollIntervalRef.current = setInterval(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft += scrollSpeed;
          }
        }, 16);
      }
    };

    const handleDragEnd = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };

    if (draggedStepId) {
      document.addEventListener("dragover", handleDragOver);
      document.addEventListener("dragend", handleDragEnd);
    }

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragend", handleDragEnd);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [draggedStepId]);

  return (
    <div className="space-y-6">
      <WorkflowToolbar />

      <div
        ref={scrollContainerRef}
        className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl p-4 md:p-6 overflow-x-auto"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-xl opacity-50"></div>

        <div className="relative flex items-center gap-3 md:gap-4 min-w-max py-4">
          {/* Merge steps và removingSteps để render cùng nhau */}
          {[
            ...steps,
            ...removingSteps.filter(
              (s) => !steps.some((step) => step.id === s.id)
            )
          ].map((step, index) => {
            const isNewStep = newStepIds.has(step.id);
            const isRemoving = removingStepIds.has(step.id);
            const isMoving = movingStepIds.has(step.id);
            const hasAnimated = animatedStepIdsRef.current.has(step.id);
            const isBrandNew =
              !hasAnimated && !previousStepIdsRef.current.has(step.id);
            // Tìm index thực tế của step trong steps array hoặc previousStepsRef
            const actualIndex = steps.findIndex((s) => s.id === step.id);
            const previousIndex = previousStepsRef.current.findIndex(
              (s) => s.id === step.id
            );
            const displayIndex =
              actualIndex !== -1 ? actualIndex : previousIndex;

            // Check if this step can be dragged
            const stepIsDraft = step.status === "draft";
            const stepIsAfterCurrent = actualIndex > currentStepIndex;
            const canDrag = stepIsDraft || stepIsAfterCurrent;

            return (
              <React.Fragment
                key={isRemoving ? `removing-${step.id}` : step.id}
              >
                {/* Drop zone before step */}
                {displayIndex !== -1 && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedStepId && draggedStepId !== step.id) {
                        setDragOverIndex(displayIndex);
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Only clear if we're leaving the drop zone area
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX;
                      const y = e.clientY;
                      if (
                        x < rect.left ||
                        x > rect.right ||
                        y < rect.top ||
                        y > rect.bottom
                      ) {
                        setDragOverIndex(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const draggedId = draggedStepId;
                      if (draggedId && draggedId !== step.id) {
                        const draggedIndex = steps.findIndex(
                          (s) => s.id === draggedId
                        );
                        if (
                          draggedIndex !== -1 &&
                          draggedIndex !== displayIndex
                        ) {
                          setMovingStepIds(new Set([draggedId]));
                          moveStepTo(draggedId, displayIndex);
                        }
                      }
                      setDraggedStepId(null);
                      setDragOverIndex(null);
                    }}
                    className={cn(
                      "w-0 h-full min-h-[320px] rounded transition-all duration-300 flex-shrink-0 relative hidden",
                      dragOverIndex === displayIndex &&
                        draggedStepId !== step.id
                        ? "scale-y-105"
                        : ""
                    )}
                    style={{
                      ...(dragOverIndex === displayIndex &&
                      draggedStepId !== step.id
                        ? {
                            background:
                              "linear-gradient(to right, transparent 0%, hsl(var(--primary) / 0.15) 50%, transparent 100%)",
                            boxShadow:
                              "inset 0 0 20px hsl(var(--primary) / 0.2)"
                          }
                        : draggedStepId && draggedStepId !== step.id
                        ? {
                            background:
                              "linear-gradient(to right, transparent 0%, hsl(var(--primary) / 0.05) 50%, transparent 100%)"
                          }
                        : {})
                    }}
                  />
                )}

                <div
                  className={cn(
                    "flex items-center relative",
                    // Force step mới luôn bắt đầu ẩn
                    (isBrandNew || isNewStep) && "step-new-initial",
                    // Smooth transition cho các step bình thường
                    !isNewStep &&
                      !isRemoving &&
                      !isMoving &&
                      "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    // Animation cho step mới
                    isNewStep &&
                      "animate-in fade-in slide-in-from-left-4 zoom-in-95 duration-600",
                    // Animation cho step đang bị xóa
                    isRemoving &&
                      "animate-out fade-out slide-out-to-right-4 zoom-out-95 duration-400 pointer-events-none"
                  )}
                  style={{
                    // Smooth move animation
                    ...(isMoving && !isNewStep && !isRemoving
                      ? {
                          transform: "scale(1.03) translateY(-3px)",
                          transition:
                            "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          zIndex: 10
                        }
                      : {}),
                    // Smooth position transition khi không có animation đặc biệt
                    ...(!isNewStep &&
                      !isRemoving &&
                      !isMoving && {
                        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                      })
                  }}
                  data-step-id={step.id}
                  data-is-new={isNewStep ? "true" : "false"}
                >
                  <WorkflowStep
                    step={step}
                    index={displayIndex}
                    onMoveStart={() => {
                      if (!isRemoving) {
                        setMovingStepIds(new Set([step.id]));
                      }
                    }}
                    onDragStart={() => {
                      if (canDrag) {
                        setDraggedStepId(step.id);
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedStepId(null);
                      setDragOverIndex(null);
                    }}
                  />
                  {/* Drop zone on step itself - để swap khi drop vào step */}
                  {displayIndex !== -1 &&
                    canDrag &&
                    draggedStepId &&
                    draggedStepId !== step.id && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverIndex(displayIndex);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX;
                          const y = e.clientY;
                          if (
                            x < rect.left ||
                            x > rect.right ||
                            y < rect.top ||
                            y > rect.bottom
                          ) {
                            setDragOverIndex(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const draggedId = draggedStepId;
                          if (draggedId && draggedId !== step.id) {
                            const draggedIndex = steps.findIndex(
                              (s) => s.id === draggedId
                            );
                            if (
                              draggedIndex !== -1 &&
                              draggedIndex !== displayIndex
                            ) {
                              setMovingStepIds(new Set([draggedId, step.id]));
                              // Swap 2 steps
                              swapSteps(draggedId, step.id);
                            }
                          }
                          setDraggedStepId(null);
                          setDragOverIndex(null);
                        }}
                        className={cn(
                          "absolute inset-0 rounded-xl transition-all duration-300 z-20 pointer-events-auto",
                          dragOverIndex === displayIndex
                            ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background scale-[1.02]"
                            : ""
                        )}
                        style={{
                          ...(dragOverIndex === displayIndex
                            ? {
                                background:
                                  "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.05) 100%)",
                                boxShadow:
                                  "0 0 0 1px hsl(var(--primary) / 0.2), 0 4px 12px hsl(var(--primary) / 0.15)"
                              }
                            : draggedStepId && draggedStepId !== step.id
                            ? {
                                background:
                                  "linear-gradient(135deg, hsl(var(--primary) / 0.03) 0%, transparent 100%)"
                              }
                            : {})
                        }}
                      />
                    )}
                </div>

                {/* Arrow between steps */}
                {displayIndex !== -1 &&
                  displayIndex < steps.length - 1 &&
                  !isRemoving && <WorkflowArrow />}

                {/* Drop zone after last step */}
                {displayIndex !== -1 &&
                  displayIndex === steps.length - 1 &&
                  !isRemoving && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggedStepId && draggedStepId !== step.id) {
                          setDragOverIndex(displayIndex + 1);
                        }
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX;
                        const y = e.clientY;
                        if (
                          x < rect.left ||
                          x > rect.right ||
                          y < rect.top ||
                          y > rect.bottom
                        ) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const draggedId = draggedStepId;
                        if (draggedId && draggedId !== step.id) {
                          const draggedIndex = steps.findIndex(
                            (s) => s.id === draggedId
                          );
                          if (draggedIndex !== -1) {
                            setMovingStepIds(new Set([draggedId]));
                            moveStepTo(draggedId, displayIndex + 1);
                          }
                        }
                        setDraggedStepId(null);
                        setDragOverIndex(null);
                      }}
                      className={cn(
                        "w-4 h-full min-h-[320px] rounded transition-all duration-300 flex-shrink-0 relative",
                        dragOverIndex === displayIndex + 1 &&
                          draggedStepId !== step.id
                          ? "scale-y-105"
                          : ""
                      )}
                      style={{
                        ...(dragOverIndex === displayIndex + 1 &&
                        draggedStepId !== step.id
                          ? {
                              background:
                                "linear-gradient(to right, transparent 0%, hsl(var(--primary) / 0.15) 50%, transparent 100%)",
                              boxShadow:
                                "inset 0 0 20px hsl(var(--primary) / 0.2)"
                            }
                          : draggedStepId && draggedStepId !== step.id
                          ? {
                              background:
                                "linear-gradient(to right, transparent 0%, hsl(var(--primary) / 0.05) 50%, transparent 100%)"
                            }
                          : {})
                      }}
                    />
                  )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
