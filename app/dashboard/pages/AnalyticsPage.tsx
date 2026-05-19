import { useEffect, useMemo, useState } from "react";
import { BarChart3, Eye, Package, CheckCircle2 } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { SessionUser } from "../types/dashboard";
import { providerService, ServiceListing } from "@/services/provider.service";

interface AnalyticsPageProps {
  color: string;
  user: SessionUser;
}

function providerKind(role: string): "property" | "spare" | "beauty" | undefined {
  if (["landlord", "agent"].includes(role)) return "property";
  if (role === "spareSeller") return "spare";
  if (role === "beautyProvider") return "beauty";
  return undefined;
}

export function AnalyticsPage({ color, user }: AnalyticsPageProps) {
  const [items, setItems] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const kind = providerKind(user.role);

  useEffect(() => {
    setLoading(true);
    const request = user.activeProviderId && kind
      ? providerService.listProviderServices(user.activeProviderId, kind)
      : providerService.browseServices(kind);
    request
      .then((res) => setItems(res.data?.items ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load analytics."))
      .finally(() => setLoading(false));
  }, [kind, user.activeProviderId]);

  const monthCounts = useMemo(() => {
    const counts = Array.from({ length: 12 }, () => 0);
    items.forEach((item) => {
      if (!item.created_at) return;
      counts[new Date(item.created_at).getMonth()] += 1;
    });
    return counts;
  }, [items]);

  const max = Math.max(...monthCounts, 1);
  const stats = [
    { label: "Total Listings", value: items.length, icon: Package },
    { label: "Available", value: items.filter((item) => item.is_available).length, icon: CheckCircle2 },
    { label: "Unavailable", value: items.filter((item) => !item.is_available).length, icon: Eye },
    { label: "New This Month", value: monthCounts[new Date().getMonth()], icon: BarChart3 },
  ];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <PageShell title="Analytics" subtitle="Live listing performance from your workspace" color={color}>
      {error && <div className="mb-3 text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</div>}
      {loading && <div className="mb-3 text-sm" style={{ color: "#8ca5bc" }}>Loading analytics...</div>}
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 mb-5">
        {stats.map((card) => {
          const CardIcon = card.icon;
          return (
            <div key={card.label} className="rounded-xl p-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-2">
                <CardIcon size={14} style={{ color }} />
              </div>
              <div className="text-xl font-black" style={{ color }}>{card.value}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "#8ca5bc" }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl p-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary, white)" }}>Listings Created</h3>
          <span className="text-[11px]" style={{ color: "#8ca5bc" }}>{new Date().getFullYear()}</span>
        </div>
        <div className="flex items-end gap-1.5 h-28">
          {monthCounts.map((count, i) => (
            <div key={months[i]} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm transition-all duration-500"
                style={{ height: `${Math.max(4, (count / max) * 100)}%`, background: count ? color : `${color}25`, borderRadius: "3px 3px 0 0" }} />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-1">
          {months.map((month) => (
            <div key={month} className="flex-1 text-center" style={{ fontSize: "8px", color: "#8ca5bc" }}>{month}</div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
