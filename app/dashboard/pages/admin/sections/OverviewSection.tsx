import React from "react";
import { Users, UserX, ShieldCheck, UserPlus, CreditCard } from "lucide-react";
import { ManagementOverview } from "@/services/admin.service";
import { Bar } from "../components/Bar";
import { SupportTicket, ManagedPayment, ManagedReview } from "@/services/admin.service";
import { Stat } from "../components/stat";

interface OverviewSectionProps {
  overview: ManagementOverview | null;
  tickets: SupportTicket[];
  payments: ManagedPayment[];
  reviews: ManagedReview[];
  color: string;
}

export function OverviewSection({ overview, tickets, payments, reviews, color }: OverviewSectionProps) {
  const hasActivity = tickets.length + payments.length + reviews.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
        <Stat label="Total Users" value={overview?.users.total ?? 0} icon={Users} />
        <Stat label="Suspended" value={overview?.users.suspended ?? 0} icon={UserX} />
        <Stat label="Pending Prov." value={overview?.providers.pending ?? 0} icon={ShieldCheck} />
        <Stat label="Open Support" value={overview?.support.open ?? 0} icon={UserPlus} />
        <Stat label="Payments" value={overview?.payments.total ?? 0} icon={CreditCard} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            background: "var(--bg-secondary, #132333)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#8ca5bc" }}>
            User Health
          </h3>
          <Bar label="Active" value={overview?.users.active ?? 0} total={overview?.users.total ?? 0} tone="#10b981" />
          <Bar label="Suspended" value={overview?.users.suspended ?? 0} total={overview?.users.total ?? 0} tone="#ef4444" />
          <Bar label="Unverified" value={overview?.users.unverified ?? 0} total={overview?.users.total ?? 0} tone="#f5ab20" />
        </div>

        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            background: "var(--bg-secondary, #132333)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#8ca5bc" }}>
            Provider Review
          </h3>
          <Bar label="Approved" value={overview?.providers.approved ?? 0} total={overview?.providers.total ?? 0} tone="#10b981" />
          <Bar label="Pending" value={overview?.providers.pending ?? 0} total={overview?.providers.total ?? 0} tone="#f5ab20" />
          <Bar label="Rejected" value={overview?.providers.rejected ?? 0} total={overview?.providers.total ?? 0} tone="#ef4444" />
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-secondary, #132333)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h3 className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: "#8ca5bc" }}>
            Recent Activity
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {[
              ...tickets.slice(0, 3).map((t) => ({
                label: t.subject,
                sub: `Support · ${t.status}`,
                tone: "#38bdf8",
              })),
              ...payments.slice(0, 3).map((p) => ({
                label: p.payment_type,
                sub: `${p.currency} ${p.amount.toLocaleString()} · ${p.status}`,
                tone: "#10b981",
              })),
              ...reviews.slice(0, 3).map((r) => ({
                label: r.provider.business_name || "Review",
                sub: `${r.rating}/5 · ${r.reviewer.email}`,
                tone: "#f5ab20",
              })),
            ]
              .slice(0, 5)
              .map((item, idx) => (
                <div
                  key={`${item.label}-${item.sub}-${idx}`}
                  className="flex items-center gap-2 rounded-lg p-2"
                  style={{ background: "var(--bg-elevated, #1a2e42)" }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.tone }} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: "var(--text-primary, white)" }}>
                      {item.label}
                    </div>
                    <div className="text-[10px] truncate" style={{ color: "#8ca5bc" }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            {!hasActivity && (
              <div className="text-xs" style={{ color: "#8ca5bc" }}>
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}