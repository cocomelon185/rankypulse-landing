"use client";

import { create } from "zustand";
import type { AuditData, AuditIssueData } from "./audit-data";
import { EMPTY_AUDIT } from "./audit-data";

interface AuditState {
  data: AuditData;
  completedFixIds: string[];
  activeIssueId: string | null;
  expandedIssueId: string | null;
  isLoading: boolean;
  loadError: string | null;

  setData: (data: AuditData) => void;
  setLoading: (loading: boolean) => void;
  setLoadError: (err: string | null) => void;
  markFixed: (issueId: string) => void;
  setActiveIssue: (issueId: string | null) => void;
  setExpandedIssue: (issueId: string | null) => void;

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
  data: EMPTY_AUDIT,
  completedFixIds: [],
  activeIssueId: null,
  expandedIssueId: null,
  isLoading: false,
  loadError: null,

  setData: (data) => set({ data, completedFixIds: [], loadError: null, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadError: (err) => set({ loadError: err, isLoading: false }),

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
    const sorted = [...road].sort((a, b) => a.order - b.order);
    for (const step of sorted) {
      if (!completed.includes(step.issueId) && !step.isLocked) {
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
