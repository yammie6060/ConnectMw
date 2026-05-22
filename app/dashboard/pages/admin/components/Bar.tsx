import React from "react";

interface BarProps {
  label: string;
  value: number;
  total: number;
  tone?: string;
}

export function Bar({ label, value, total, tone = "var(--color, #3b82f6)" }: BarProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "#8ca5bc" }}>
        <span>{label}</span>
        <span className="font-bold" style={{ color: "var(--text-primary, white)" }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${total ? Math.max(4, Math.round((value / total) * 100)) : 0}%`,
            background: tone,
          }}
        />
      </div>
    </div>
  );
}