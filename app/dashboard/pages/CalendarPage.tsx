import { useState } from 'react';
import { PageShell } from '../components/PageShell';

const UPCOMING = [
  { id: 1, title: "Hair Braiding – Thandiwe M.",  time: "Today · 10:00 AM",   duration: "2h",  status: "Confirmed", color: "#10b981" },
  { id: 2, title: "Nail Art – Chisomo B.",         time: "Today · 2:00 PM",    duration: "1h",  status: "Pending",   color: "#f5ab20" },
  { id: 3, title: "Makeup – Wedding client",        time: "Tomorrow · 8:00 AM", duration: "3h",  status: "Confirmed", color: "#10b981" },
  { id: 4, title: "Property Viewing – Kabulonga",  time: "Fri · 11:00 AM",     duration: "30m", status: "Confirmed", color: "#10b981" },
  { id: 5, title: "Eyebrow Threading – Natasha",   time: "Sat · 9:00 AM",      duration: "45m", status: "New",       color: "#3b82f6" },
];

interface CalendarPageProps {
  color: string;
  role: string;
}

export function CalendarPage({ color, role }: CalendarPageProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = [5, 6, 7, 8, 9, 10, 11];
  const [selectedDay, setSelectedDay] = useState(4);

  return (
    <PageShell title={role === "beautyProvider" ? "Schedule" : "Calendar"} subtitle="Upcoming appointments & bookings" color={color}>
      <div className="rounded-xl p-3 mb-4 flex gap-1" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {days.map((d, i) => (
          <button key={d} onClick={() => setSelectedDay(i)}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all"
            style={{
              background: selectedDay === i ? color : "transparent",
              color: selectedDay === i ? "#0d1f2d" : "#8ca5bc",
            }}>
            <span className="text-[9px] font-semibold">{d}</span>
            <span className="text-sm font-black">{dates[i]}</span>
          </button>
        ))}
      </div>

      <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "#8ca5bc" }}>Upcoming</h3>
      <div className="flex flex-col gap-2.5">
        {UPCOMING.map(ev => (
          <div key={ev.id} className="rounded-xl p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5"
            style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: ev.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary, white)" }}>{ev.title}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "#8ca5bc" }}>{ev.time} · {ev.duration}</div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: `${ev.color}20`, color: ev.color, border: `1px solid ${ev.color}40` }}>
              {ev.status}
            </span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}