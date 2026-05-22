import React from "react";
import { LucideIcon } from "lucide-react";

interface StatProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
}

export function Stat({ label, value, icon: Icon }: StatProps) {
  return (
    <div
      className="rounded-xl p-3 sm:p-4"
      style={{
        background: "var(--bg-secondary, #132333)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div
            className="text-[10px] uppercase tracking-widest font-bold"
            style={{ color: "#8ca5bc" }}
          >
            {label}
          </div>
          <div className="text-xl sm:text-2xl font-black mt-1" style={{ color: "var(--text-primary, white)" }}>
            {value}
          </div>
        </div>
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `var(--color, #3b82f6)18`, color: "var(--color, #3b82f6)" }}
        >
          <Icon size={16} className="sm:w-[17px] sm:h-[17px]" />
        </div>
      </div>
    </div>
  );
}