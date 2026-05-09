import { PageShell } from '../components/PageShell';

interface BookingsPageProps {
  color: string;
}

export function BookingsPage({ color }: BookingsPageProps) {
  const bookings = [
    { id: 1, title: "Grace Nails Studio – Manicure", date: "Tomorrow · 2:00 PM", status: "Confirmed", price: "K5,000" },
    { id: 2, title: "Hair Braiding – NaturalGlow",   date: "Sat · 10:00 AM",    status: "Pending",   price: "K15,000" },
  ];
  
  return (
    <PageShell title="Bookings" subtitle="Your upcoming appointments" color={color}>
      <div className="flex flex-col gap-3">
        {bookings.map(b => (
          <div key={b.id} className="rounded-xl p-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{b.title}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: b.status === "Confirmed" ? "#10b98120" : "#f5ab2020", color: b.status === "Confirmed" ? "#10b981" : "#f5ab20" }}>
                {b.status}
              </span>
            </div>
            <div className="text-[11px] mb-3" style={{ color: "#8ca5bc" }}>{b.date} · {b.price}</div>
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: `${color}15`, color }}>Reschedule</button>
              <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}