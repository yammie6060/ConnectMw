import { PageShell } from '../components/PageShell';
import { ArrowUpRight } from 'lucide-react';

interface AnalyticsPageProps {
  color: string;
  meta: any;
}

export function AnalyticsPage({ color, meta }: AnalyticsPageProps) {
  const bars = [40, 65, 30, 80, 55, 70, 45, 90, 60, 75, 50, 85];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <PageShell title="Analytics" subtitle="Your performance at a glance" color={color}>
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 mb-5">
        {meta.statCards.map((card: any) => {
          const CardIcon = card.icon;
          return (
            <div key={card.label} className="rounded-xl p-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-2">
                <CardIcon size={14} style={{ color }} />
                {card.delta && (
                  <span className="text-[10px] font-semibold flex items-center gap-0.5" style={{ color: "#10b981" }}>
                    <ArrowUpRight size={10} /> {card.delta}
                  </span>
                )}
              </div>
              <div className="text-xl font-black" style={{ color }}>{card.value}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "#8ca5bc" }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl p-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary, white)" }}>Revenue Overview</h3>
          <select className="text-[11px] rounded-lg px-2 py-1 outline-none" style={{ background: "#1a2e42", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}>
            <option>2025</option><option>2024</option>
          </select>
        </div>
        <div className="flex items-end gap-1.5 h-28">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm transition-all duration-500"
                style={{ height: `${h}%`, background: i === 4 ? color : `${color}40`, borderRadius: "3px 3px 0 0" }} />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-1">
          {months.map((m, i) => (
            <div key={m} className="flex-1 text-center" style={{ fontSize: "8px", color: i === 4 ? color : "#8ca5bc" }}>{m}</div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
