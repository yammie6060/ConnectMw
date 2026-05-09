import { PageShell } from '../components/PageShell';
import { Heart } from 'lucide-react';

interface RentalsPageProps {
  color: string;
}

export function RentalsPage({ color }: RentalsPageProps) {
  const saved = [
    { id: 1, title: "2-Bed Flat, Area 47", price: "K95,000/mo", beds: 2, status: "Available", saved: true },
    { id: 2, title: "Studio, Area 3",      price: "K65,000/mo", beds: 1, status: "Available", saved: true },
    { id: 3, title: "3-Bed House, Kabulonga", price: "K180,000/mo", beds: 3, status: "Occupied", saved: true },
  ];
  
  return (
    <PageShell title="Rentals" subtitle="Saved rental listings" color={color}>
      <div className="flex flex-col gap-3">
        {saved.map(r => (
          <div key={r.id} className="rounded-xl p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5"
            style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${color}15` }}>🏠</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{r.title}</div>
              <div className="text-xs mt-0.5" style={{ color: "#8ca5bc" }}>{r.beds} bedroom{r.beds > 1 ? "s" : ""} · {r.price}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: r.status === "Available" ? "#10b98120" : "#8ca5bc20", color: r.status === "Available" ? "#10b981" : "#8ca5bc" }}>
                {r.status}
              </span>
              <button style={{ color }}><Heart size={14} fill={color} /></button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}