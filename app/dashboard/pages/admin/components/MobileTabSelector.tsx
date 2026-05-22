import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AdminTab } from "@/types";
import { TABS } from "@/constants";

interface MobileTabSelectorProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export function MobileTabSelector({ currentTab, onTabChange }: MobileTabSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTabLabel = TABS.find(([id]) => id === currentTab)?.[1] || "Overview";

  return (
    <div className="sm:hidden mb-4 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl"
        style={{
          background: "var(--bg-secondary, #132333)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span className="text-sm font-bold" style={{ color: "var(--text-primary, white)" }}>
          {currentTabLabel}
        </span>
        <ChevronDown size={16} style={{ color: "#8ca5bc" }} />
      </button>
      
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
          style={{
            background: "var(--bg-secondary, #132333)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {TABS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                onTabChange(id);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm transition-colors border-b border-white/5 last:border-b-0"
              style={{
                color: currentTab === id ? "var(--color, #3b82f6)" : "#8ca5bc",
                background: currentTab === id ? "var(--color, #3b82f6)10" : "transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}