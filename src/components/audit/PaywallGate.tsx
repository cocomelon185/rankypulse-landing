"use client";

interface PaywallGateProps {
  open: boolean;
  remainingFixes: number;
  estimatedVisits: string;
  onClose: () => void;
  onUpgradeClick: () => void;
}

export function PaywallGate({
  open,
  remainingFixes,
  estimatedVisits,
  onClose,
  onUpgradeClick,
}: PaywallGateProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-[#1B2559]">
          Unlock remaining fixes ({remainingFixes}) + page-level roadmap
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Recover an estimated {estimatedVisits} visits/mo with full fix steps, 7-day roadmap, and competitor benchmark.
        </p>
        <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
          <p>Used by 1,200+ sites</p>
          <p className="mt-1">&ldquo;We finally had a clear plan after the first audit.&rdquo; — Customer quote placeholder</p>
        </div>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={onUpgradeClick}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-[#4318ff] text-sm font-semibold text-white hover:bg-[#3311db]"
          >
            Upgrade to unlock
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-sm font-medium text-gray-600 hover:underline"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
