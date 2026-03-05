"use client";

/**
 * audit-context.ts — Global Active Audit Context
 *
 * Tracks the currently "active" audit session across the app.
 *
 *   Free audits  → auditId = "local"  (data lives in Zustand / use-audit.ts)
 *   Full audits  → auditId = UUID     (data lives in Supabase crawl_jobs / audit_pages)
 *
 * Persisted to sessionStorage so it survives hard refreshes within the same tab.
 */

import { create } from "zustand";

const STORAGE_KEY = "rankypulse_active_audit";

interface ActiveAudit {
  auditId: string | null;
  domain: string | null;
}

interface AuditContextState extends ActiveAudit {
  setActiveAudit: (auditId: string, domain: string) => void;
  clearActiveAudit: () => void;
  /** Call once on app mount to rehydrate from sessionStorage */
  initFromStorage: () => void;
}

function readStorage(): ActiveAudit {
  if (typeof window === "undefined") return { auditId: null, domain: null };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { auditId: null, domain: null };
    return JSON.parse(raw) as ActiveAudit;
  } catch {
    return { auditId: null, domain: null };
  }
}

function writeStorage(value: ActiveAudit) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // sessionStorage unavailable (e.g., private browsing — fail silently)
  }
}

export const useAuditContext = create<AuditContextState>((set) => ({
  auditId: null,
  domain: null,

  setActiveAudit: (auditId: string, domain: string) => {
    const value: ActiveAudit = { auditId, domain };
    writeStorage(value);
    set(value);
  },

  clearActiveAudit: () => {
    writeStorage({ auditId: null, domain: null });
    set({ auditId: null, domain: null });
  },

  initFromStorage: () => {
    const stored = readStorage();
    if (stored.auditId) {
      set(stored);
    }
  },
}));

/** Convenience: returns the current {auditId, domain} from the context store */
export function useActiveAudit(): ActiveAudit {
  return useAuditContext((s) => ({ auditId: s.auditId, domain: s.domain }));
}

/** Standalone setter (callable outside React, e.g. in event handlers) */
export function setActiveAudit(auditId: string, domain: string) {
  useAuditContext.getState().setActiveAudit(auditId, domain);
}

/** Standalone getter */
export function getActiveAudit(): ActiveAudit {
  return {
    auditId: useAuditContext.getState().auditId,
    domain: useAuditContext.getState().domain,
  };
}
