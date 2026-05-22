import React from "react";
import { SupportTicket } from "@/services/admin.service";
import { inputStyle } from "@/constants";

interface SupportSectionProps {
  tickets: SupportTicket[];
  actionLoading: Record<string, boolean>;
  color: string;
  onUpdateTicket: (ticketId: string, status: string) => Promise<void>;
}

export function SupportSection({ tickets, actionLoading, color, onUpdateTicket }: SupportSectionProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--bg-secondary, #132333)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {tickets.map((ticket) => (
        <div key={ticket.id} className="p-3 sm:p-4 border-b border-white/5 last:border-b-0">
          <div className="flex flex-col gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm sm:text-base" style={{ color: "var(--text-primary, white)" }}>
                {ticket.subject}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#8ca5bc" }}>
                {ticket.category} · {ticket.user?.email || "No user"} · {ticket.priority}
              </div>
              <p className="text-sm mt-2 break-words" style={{ color: "#cde0f0" }}>
                {ticket.message}
              </p>
            </div>
            <select
              value={ticket.status}
              onChange={(e) => onUpdateTicket(ticket.id, e.target.value)}
              disabled={actionLoading[`ticket:${ticket.id}`]}
              className="w-full sm:w-auto flex-shrink-0 rounded-lg px-3 py-2 text-xs outline-none"
              style={inputStyle}
            >
              <option value="open">open</option>
              <option value="in_progress">in progress</option>
              <option value="resolved">resolved</option>
              <option value="closed">closed</option>
            </select>
          </div>
        </div>
      ))}
      {tickets.length === 0 && (
        <div className="p-5 text-sm" style={{ color: "#8ca5bc" }}>
          No support tickets found.
        </div>
      )}
    </div>
  );
}