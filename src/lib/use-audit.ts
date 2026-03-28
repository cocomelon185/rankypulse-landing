"use client";

import { create } from "zustand";
import type { AuditData, AuditIssueData } from "./audit-data";
import { MOCK_AUDIT } from "./audit-data";

export interface RoadmapTask {
  id: string;
  type: "CONTENT" | "LINK" | "TECHNICAL";
  title: string;
  description: string;
  impact: "HIGH" | "MED";
  effort: string;
  status: "TODO" | "DONE";
  addedAt: number;
}

export interface BrandingConfig {
  logoUrl: string | null;
  primaryColor: string;
  shareEnabled: boolean;
  sharePassword: string;
}

interface AuditState {
  data: AuditData;
  completedFixIds: string[];
  skippedIds: string[];
  activeIssueId: string | null;
  expandedIssueId: string | null;
  isLoading: boolean;
  loadError: string | null;
  brandingConfig: BrandingConfig;
  roadmapTasks: RoadmapTask[];

  setData: (data: AuditData) => void;
  setLoading: (loading: boolean) => void;
  setLoadError: (err: string | null) => void;
  markFixed: (issueId: string) => void;
  skipIssue: (issueId: string) => void;
  setActiveIssue: (issueId: string | null) => void;
  setExpandedIssue: (issueId: string | null) => void;
  setBrandingConfig: (patch: Partial<BrandingConfig>) => void;
  addTaskToRoadmap: (task: RoadmapTask) => void;
  removeTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  clearRoadmap: () => void;

  openIssues: () => AuditIssueData[];
  fixedIssues: () => AuditIssueData[];
  lockedIssues: () => AuditIssueData[];
  currentTask: () => AuditIssueData | null;
  completedCount: () => number;
  totalFreeCount: () => number;
  progressPercent: () => number;
  adjustedScore: () => number;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  data: MOCK_AUDIT,
  completedFixIds: [],
  skippedIds: [],
  activeIssueId: null,
  expandedIssueId: null,
  isLoading: false,
  loadError: null,
  brandingConfig: {
    logoUrl: null,
    primaryColor: "#FF642D",
    shareEnabled: false,
    sharePassword: "",
  },
  roadmapTasks: [],

  addTaskToRoadmap: (task) =>
    set((s) => ({ roadmapTasks: [...s.roadmapTasks, task] })),

  removeTask: (id) =>
    set((s) => ({ roadmapTasks: s.roadmapTasks.filter((t) => t.id !== id) })),

  toggleTaskStatus: (id) =>
    set((s) => ({
      roadmapTasks: s.roadmapTasks.map((t) =>
        t.id === id ? { ...t, status: t.status === "DONE" ? "TODO" : "DONE" } : t
      ),
    })),

  clearRoadmap: () => set({ roadmapTasks: [] }),

  setData: (data) => set({ data, completedFixIds: [], skippedIds: [], loadError: null, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadError: (err) => set({ loadError: err, isLoading: false }),

  skipIssue: (issueId) =>
    set((state) => ({
      skippedIds: state.skippedIds.includes(issueId)
        ? state.skippedIds
        : [...state.skippedIds, issueId],
    })),

  markFixed: (issueId) => {
    set((state) => {
      const next = state.completedFixIds.includes(issueId)
        ? state.completedFixIds
        : [...state.completedFixIds, issueId];
      const newData = {
        ...state.data,
        issues: state.data.issues.map((i) =>
          i.id === issueId ? { ...i, status: "fixed" as const } : i
        ),
      };
      return { completedFixIds: next, data: newData };
    });
  },

  setActiveIssue: (id) => set({ activeIssueId: id }),
  setBrandingConfig: (patch) =>
    set((s) => ({ brandingConfig: { ...s.brandingConfig, ...patch } })),
  setExpandedIssue: (id) =>
    set((state) => ({
      expandedIssueId: state.expandedIssueId === id ? null : id,
    })),

  openIssues: () =>
    get().data.issues.filter(
      (i) => i.status === "open" || i.status === "in-progress"
    ),
  fixedIssues: () =>
    get().data.issues.filter((i) => i.status === "fixed"),
  lockedIssues: () =>
    get().data.issues.filter((i) => i.status === "locked"),
  currentTask: () => {
    const issues = get().data.issues;
    const road = get().data.roadmap;
    const completed = get().completedFixIds;
    const skipped = get().skippedIds;
    const sorted = [...road].sort((a, b) => a.order - b.order);
    for (const step of sorted) {
      if (!completed.includes(step.issueId) && !skipped.includes(step.issueId) && !step.isLocked) {
        return issues.find((i) => i.id === step.issueId) ?? null;
      }
    }
    return null;
  },
  completedCount: () => get().completedFixIds.length,
  totalFreeCount: () =>
    get().data.roadmap.filter((r) => !r.isLocked).length,
  progressPercent: () => {
    const total = get().data.roadmap.filter((r) => !r.isLocked).length;
    return total > 0
      ? Math.round((get().completedFixIds.length / total) * 100)
      : 0;
  },
  adjustedScore: () => {
    const issues = get().data.issues;
    const openIssues = issues.filter((i) => i.status === "open" || i.status === "in-progress" || i.status === "locked");

    if (openIssues.length === 0) return 100;

    let penalty = 0;
    openIssues.forEach((issue) => {
      switch (issue.priority) {
        case "critical": penalty += 12; break;
        case "high": penalty += 8; break;
        case "medium": penalty += 4; break;
        case "low": penalty += 2; break;
        case "opportunity": penalty += 1; break;
      }
    });

    return Math.max(0, 100 - penalty);
  },
}));
