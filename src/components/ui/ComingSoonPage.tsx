"use client";

import { Clock } from "lucide-react";
import Link from "next/link";

interface ComingSoonPageProps {
  feature: string;
  description: string;
  icon?: React.ReactNode;
}

export function ComingSoonPage({ feature, description, icon }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
        style={{ background: "rgba(255,100,45,0.12)", border: "1px solid rgba(255,100,45,0.2)" }}
      >
        {icon ?? <Clock size={28} style={{ color: "#FF642D" }} />}
      </div>

      <div
        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
        style={{ color: "#FF642D", background: "rgba(255,100,45,0.1)", border: "1px solid rgba(255,100,45,0.2)" }}
      >
        Coming Soon
      </div>

      <h1 className="text-2xl font-black text-white tracking-tight mb-2">{feature}</h1>
      <p className="text-sm max-w-sm" style={{ color: "#6B7A99" }}>
        {description}
      </p>

      <p className="text-xs mt-8" style={{ color: "#4A5568" }}>
        In the meantime, explore your{" "}
        <Link href="/audits/full" className="underline" style={{ color: "#FF642D" }}>
          Site Audit
        </Link>{" "}
        and{" "}
        <Link href="/action-center" className="underline" style={{ color: "#FF642D" }}>
          Action Center
        </Link>
        .
      </p>
    </div>
  );
}
