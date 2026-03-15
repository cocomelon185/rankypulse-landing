"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Palette, ImageIcon } from "lucide-react";
import { useAuditStore } from "@/lib/use-audit";

interface ReportBrandingModalProps {
  onClose: () => void;
}

export function ReportBrandingModal({ onClose }: ReportBrandingModalProps) {
  const brandingConfig = useAuditStore((s) => s.brandingConfig);
  const setBrandingConfig = useAuditStore((s) => s.setBrandingConfig);

  const [localLogo, setLocalLogo] = useState<string | null>(brandingConfig.logoUrl);
  const [localColor, setLocalColor] = useState(brandingConfig.primaryColor);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLocalLogo(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setBrandingConfig({ logoUrl: localLogo, primaryColor: localColor });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[var(--bg-elevated,#1C2333)] p-6 shadow-2xl"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
          Report Branding
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Customize your PDF export with agency branding.
        </p>

        <div className="mt-6 space-y-5">
          {/* Logo upload */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Agency Logo
            </label>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.04]">
                {localLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={localLogo} alt="Agency logo" className="h-full w-full object-contain p-1" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-[var(--text-muted)]" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.15] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
                >
                  <Upload className="h-4 w-4" />
                  {localLogo ? "Replace Logo" : "Upload Logo"}
                </button>
                {localLogo && (
                  <button
                    type="button"
                    onClick={() => setLocalLogo(null)}
                    className="mt-1.5 w-full text-center text-xs text-[var(--text-muted)] transition hover:text-[var(--accent-red,#E02020)]"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/[0.08]">
                <div className="h-full w-full" style={{ backgroundColor: localColor }} />
                <input
                  type="color"
                  value={localColor}
                  onChange={(e) => setLocalColor(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2">
                <Palette className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="font-mono-data text-sm text-[var(--text-primary)]">{localColor}</span>
              </div>
            </div>
          </div>

          {/* Preview card */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              PDF Cover Preview
            </label>
            <div className="overflow-hidden rounded-xl border border-white/[0.08]" style={{ aspectRatio: "3/4", maxWidth: 120 }}>
              <div className="h-2 w-full" style={{ backgroundColor: localColor }} />
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#0E1117] p-3">
                {localLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={localLogo} alt="" className="h-8 w-full object-contain" />
                ) : (
                  <div className="h-6 w-12 rounded bg-white/[0.08]" />
                )}
                <div className="mt-1 h-1 w-8 rounded-full" style={{ backgroundColor: localColor }} />
                <div className="h-1 w-14 rounded bg-white/[0.06]" />
                <div className="h-1 w-10 rounded bg-white/[0.04]" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.08] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: localColor }}
          >
            Save Branding
          </button>
        </div>
      </motion.div>
    </div>
  );
}
