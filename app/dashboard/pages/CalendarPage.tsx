import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { SessionUser } from "../types/dashboard";
import { providerService, ServiceInteraction } from "@/services/provider.service";

interface CalendarPageProps {
  color: string;
  role: string;
  user: SessionUser;
}

function eventDate(item: ServiceInteraction) {
  return item.booking_date || item.created_at?.slice(0, 10) || "";
}

function eventTime(item: ServiceInteraction) {
  return item.start_time ? item.start_time.slice(0, 5) : "Time pending";
}

export function CalendarPage({ color, role, user }: CalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bookings, setBookings] = useState<ServiceInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    providerService
      .listInteractions({
        scope: "provider",
        type: "booking",
        providerId: user.activeProviderId || undefined,
      })
      .then((res) => setBookings(res.data?.items ?? []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load schedule.")
      )
      .finally(() => setLoading(false));
  }, [user.activeProviderId]);

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
  }, []);

  const selectedEvents = bookings.filter(
    (booking) => eventDate(booking) === selectedDate
  );

  return (
    <PageShell
      title={role === "beautyProvider" ? "Schedule" : "Calendar"}
      subtitle="Upcoming bookings from customers"
      color={color}
    >
      {/* Day strip */}
      <div
        className="rounded-xl p-2 mb-4 flex gap-1 overflow-x-auto scrollbar-none"
        style={{
          background: "var(--bg-secondary, #132333)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {days.map((date) => {
          const value = date.toISOString().slice(0, 10);
          const active = selectedDate === value;
          return (
            <button
              key={value}
              onClick={() => setSelectedDate(value)}
              className="min-w-[44px] flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all"
              style={{
                background: active ? color : "transparent",
                color: active ? "#0d1f2d" : "#8ca5bc",
              }}
            >
              <span className="text-[8px] sm:text-[9px] font-semibold leading-none">
                {date.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span className="text-xs sm:text-sm font-black leading-none">
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 text-xs font-semibold" style={{ color: "#ef4444" }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-sm" style={{ color: "#8ca5bc" }}>
          Loading schedule...
        </div>
      )}

      {/* Section label */}
      <h3
        className="text-[11px] font-bold uppercase tracking-widest mb-3"
        style={{ color: "#8ca5bc" }}
      >
        Bookings
      </h3>

      {/* Booking cards */}
      <div className="flex flex-col gap-2">
        {!loading &&
          selectedEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 transition-all hover:-translate-y-0.5"
              style={{
                background: "var(--bg-secondary, #132333)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Status accent bar */}
              <div
                className="w-1 self-stretch rounded-full flex-shrink-0"
                style={{
                  background:
                    event.status === "confirmed" ? "#10b981" : "#f5ab20",
                }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs sm:text-sm font-semibold truncate"
                  style={{ color: "var(--text-primary, white)" }}
                >
                  {event.listing?.title || "Beauty booking"}
                </div>
                <div
                  className="text-[11px] mt-0.5 truncate"
                  style={{ color: "#8ca5bc" }}
                >
                  {event.customer?.full_name ||
                    event.customer?.email ||
                    "Customer"}{" "}
                  · {eventTime(event)}
                </div>
              </div>

              {/* Status badge */}
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize max-w-[80px] truncate"
                style={{
                  background: "#f5ab2020",
                  color: "#f5ab20",
                  border: "1px solid #f5ab2040",
                }}
              >
                {event.status}
              </span>
            </div>
          ))}

        {/* Empty state */}
        {!loading && selectedEvents.length === 0 && (
          <div
            className="rounded-xl p-8 flex flex-col items-center gap-2 text-center"
            style={{
              background: "var(--bg-secondary, #132333)",
              color: "#8ca5bc",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <CalendarDays size={26} />
            <p className="text-sm">No bookings for this day.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}