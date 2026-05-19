import { useEffect, useState } from "react";
import { MessageSquare, Package, Home } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { SessionUser } from "../types/dashboard";
import { providerService, ServiceInteraction } from "@/services/provider.service";

interface EnquiriesPageProps {
  color: string;
  user: SessionUser;
}

function labelFor(item: ServiceInteraction) {
  if (item.type === "order") return "Spare order";
  if (item.type === "booking") return "Booking";
  return "Rental enquiry";
}

function statusColor(status: string) {
  if (["confirmed", "approved", "paid", "completed"].includes(status)) return "#10b981";
  if (["cancelled", "rejected", "failed"].includes(status)) return "#ef4444";
  return "#f5ab20";
}

export function EnquiriesPage({ color, user }: EnquiriesPageProps) {
  const [items, setItems] = useState<ServiceInteraction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    providerService
      .listInteractions({ scope: "provider", providerId: user.activeProviderId || undefined })
      .then((res) => setItems((res.data?.items ?? []).filter((item) => item.type !== "booking")))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load enquiries."))
      .finally(() => setLoading(false));
  }, [user.activeProviderId]);

  const selected = items.find((item) => item.id === selectedId) || null;

  return (
    <PageShell title="Enquiries" subtitle="Customer rental enquiries and spare part orders" color={color}>
      {error && <div className="mb-3 text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</div>}
      {loading && <div className="text-sm mb-3" style={{ color: "#8ca5bc" }}>Loading enquiries...</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2.5">
          {!loading && items.map((item) => {
            const active = selectedId === item.id;
            const Icon = item.kind === "property" ? Home : Package;
            return (
              <button key={item.id}
                onClick={() => setSelectedId(active ? null : item.id)}
                className="rounded-xl p-4 text-left cursor-pointer transition-all hover:-translate-y-0.5"
                style={{
                  background: active ? `${color}10` : "var(--bg-secondary, #132333)",
                  border: `1px solid ${active ? color + "50" : "rgba(255,255,255,0.07)"}`,
                }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}20`, color }}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary, white)" }}>{item.customer?.full_name || item.customer?.email || "Customer"}</span>
                      <span className="text-[10px]" style={{ color: "#8ca5bc" }}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                    </div>
                    <div className="text-[11px] font-medium mb-1" style={{ color }}>{item.listing?.title || labelFor(item)}</div>
                    <div className="text-[11px] truncate" style={{ color: "#8ca5bc" }}>{item.message || item.notes || item.order_number || labelFor(item)}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 capitalize"
                    style={{ background: `${statusColor(item.status)}20`, color: statusColor(item.status) }}>
                    {item.status}
                  </span>
                </div>
              </button>
            );
          })}
          {!loading && items.length === 0 && (
            <div className="rounded-xl p-8 flex flex-col items-center gap-2 text-center" style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}>
              <MessageSquare size={28} />
              <p className="text-sm">No enquiries yet.</p>
            </div>
          )}
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {selected ? (
            <>
              <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-white/5">
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{selected.customer?.full_name || selected.customer?.email || "Customer"}</div>
                  <div className="text-[11px]" style={{ color: "#8ca5bc" }}>{selected.customer?.phone || selected.customer?.email}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full capitalize" style={{ background: `${statusColor(selected.status)}20`, color: statusColor(selected.status) }}>
                  {selected.status}
                </span>
              </div>
              <div className="rounded-xl p-3 mb-3" style={{ background: "var(--bg-elevated, #1a2e42)" }}>
                <div className="text-xs font-bold mb-1" style={{ color }}>{labelFor(selected)}</div>
                <div className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{selected.listing?.title || "Listing"}</div>
                <p className="text-sm mt-3" style={{ color: "#cde0f0" }}>{selected.message || selected.notes || "No message provided."}</p>
              </div>
              {selected.type === "order" && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg p-3" style={{ background: "var(--bg-elevated, #1a2e42)", color: "#8ca5bc" }}>Quantity<br /><strong style={{ color: "var(--text-primary, white)" }}>{selected.quantity ?? 1}</strong></div>
                  <div className="rounded-lg p-3" style={{ background: "var(--bg-elevated, #1a2e42)", color: "#8ca5bc" }}>Total<br /><strong style={{ color: "var(--text-primary, white)" }}>K{(selected.total_amount ?? 0).toLocaleString()}</strong></div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <MessageSquare size={32} style={{ color: "#8ca5bc", marginBottom: 12 }} />
              <p className="text-sm" style={{ color: "#8ca5bc" }}>Select an enquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
