import { useEffect, useMemo, useState } from "react";
import { Package, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { providerService, ServiceInteraction } from "@/services/provider.service";

interface OrdersPageProps { color: string }

function statusColor(status: string) {
  if (["delivered", "completed", "paid", "confirmed"].includes(status)) return "#10b981";
  if (["cancelled", "rejected", "failed"].includes(status)) return "#ef4444";
  return "#f5ab20";
}

function statusIcon(status: string) {
  if (["delivered", "completed", "paid", "confirmed"].includes(status)) return CheckCircle2;
  if (["cancelled", "rejected", "failed"].includes(status)) return XCircle;
  return Clock;
}

export function OrdersPage({ color }: OrdersPageProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "active" | "completed">("all");
  const [orders, setOrders] = useState<ServiceInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    providerService
      .listInteractions({ scope: "customer", type: "order" })
      .then((res) => setOrders(res.data?.items ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => orders.filter((order) => {
    const completed = ["delivered", "completed", "cancelled", "rejected", "failed"].includes(order.status);
    if (tab === "active") return !completed;
    if (tab === "completed") return completed;
    return true;
  }), [orders, tab]);

  const cancelOrder = async (order: ServiceInteraction) => {
    setUpdatingId(order.id);
    setError("");
    try {
      const res = await providerService.updateInteractionStatus("order", order.id, "cancelled");
      if (res.data) setOrders((current) => current.map((item) => item.id === order.id ? res.data! : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel order.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <PageShell title="My Orders" subtitle="Track your spare part orders" color={color}>
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "var(--bg-secondary, #132333)" }}>
        {(["all", "active", "completed"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
            style={tab === t ? { background: color, color: "#0d1f2d" } : { background: "transparent", color: "#8ca5bc" }}>
            {t}
          </button>
        ))}
      </div>

      {error && <div className="mb-3 text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</div>}
      {loading && <div className="text-sm" style={{ color: "#8ca5bc" }}>Loading orders...</div>}

      <div className="flex flex-col gap-3">
        {!loading && filtered.map((order) => {
          const tone = statusColor(order.status);
          const StatusIcon = statusIcon(order.status);
          const isExpanded = expanded === order.id;
          return (
            <div key={order.id} className="rounded-2xl overflow-hidden transition-all"
              style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tone}15` }}>
                  <Package size={16} style={{ color: tone }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="text-sm font-bold truncate" style={{ color: "var(--text-primary, white)" }}>{order.listing?.title || "Spare part order"}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "#8ca5bc" }}>{order.provider?.business_name || order.provider?.display_name || "Provider"}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0 flex items-center gap-1 capitalize" style={{ background: `${tone}18`, color: tone }}>
                      <StatusIcon size={10} /> {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-xs font-black" style={{ color }}>K{(order.total_amount ?? 0).toLocaleString()}</span>
                    <span className="text-[11px]" style={{ color: "#8ca5bc" }}>{order.order_number}</span>
                    <span className="text-[11px]" style={{ color: "#8ca5bc" }}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}</span>
                  </div>
                </div>
                <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-colors hover:bg-white/5"
                  style={{ color: "#8ca5bc" }}>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 pt-1">
                  <div className="rounded-xl p-4 grid grid-cols-2 gap-2 text-xs" style={{ background: "var(--bg-elevated, #1a2e42)" }}>
                    <div style={{ color: "#8ca5bc" }}>Quantity<br /><strong style={{ color: "var(--text-primary, white)" }}>{order.quantity ?? 1}</strong></div>
                    <div style={{ color: "#8ca5bc" }}>Status<br /><strong className="capitalize" style={{ color: tone }}>{order.status}</strong></div>
                  </div>
                  {!["cancelled", "completed", "delivered", "rejected", "failed"].includes(order.status) && (
                    <button
                      disabled={updatingId === order.id}
                      onClick={() => cancelOrder(order)}
                      className="mt-3 px-3 py-2 rounded-lg text-[11px] font-bold disabled:opacity-50"
                      style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}
                    >
                      {updatingId === order.id ? "Cancelling..." : "Cancel order"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="rounded-xl p-8 flex flex-col items-center gap-2 text-center" style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Package size={28} />
            <p className="text-sm">No orders found.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
