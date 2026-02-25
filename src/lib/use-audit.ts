"use client";

import { create } from "zustand";
import type { AuditData, AuditIssueData } from "./audit-data";
import { MOCK_AUDIT } from "./audit-data";

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
  data: MOCK_AUDIT,
  completedFixIds: ["redirect-chain"],
  activeIssueId: null,
  expandedIssueId: null,
  isLoading: false,
  loadError: null,

  setData: (data) => set({ data, completedFixIds: [], loadError: null }),
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
    const base = get().data.score;
    const extraFixes = get().completedFixIds.filter(
      (id) =>
        !MOCK_AUDIT.issues.find((i) => i.id === id && i.status === "fixed")
    ).length;
    return Math.min(100, base + extraFixes * 3);
  },
}));
