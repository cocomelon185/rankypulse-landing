"use client";

import { MapPin, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuditStore } from "@/lib/use-audit";
import type { RoadmapTask } from "@/lib/use-audit";

type AddToRoadmapButtonProps = {
  task: Omit<RoadmapTask, "status" | "addedAt">;
};

export function AddToRoadmapButton({ task }: AddToRoadmapButtonProps) {
  const { addTaskToRoadmap, roadmapTasks } = useAuditStore();
  const exists = roadmapTasks.some((t) => t.id === task.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (exists) {
      toast.error("Already in your roadmap", {
        description: "This task is already in your 30-Day Growth Sprint.",
      });
      return;
    }
    addTaskToRoadmap({ ...task, status: "TODO", addedAt: Date.now() });
    toast.success("Added to Growth Roadmap!", {
      description: "View your 30-Day Sprint at /roadmap.",
    });
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
      style={
        exists
          ? {
              borderColor: "rgba(16,185,129,0.4)",
              background: "rgba(16,185,129,0.06)",
              color: "#10B981",
              cursor: "default",
            }
          : {
              borderColor: "rgba(255,100,45,0.3)",
              background: "rgba(255,100,45,0.06)",
              color: "#FF642D",
            }
      }
    >
      {exists ? (
        <>
          <Check size={12} />
          In Roadmap
        </>
      ) : (
        <>
          <MapPin size={12} />
          Add to Roadmap
        </>
      )}
    </button>
  );
}
