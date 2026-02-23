export function getLastAuditUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("rankypulse_last_url") || "";
  } catch {
    return "";
  }
}

export function shouldAutoRunAudit(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("rankypulse_autorun_audit") === "1";
  } catch {
    return false;
  }
}

export function clearAutoRunAudit(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("rankypulse_autorun_audit");
  } catch {}
}
