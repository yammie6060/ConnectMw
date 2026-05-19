import { useEffect, useState } from "react";
import { CalendarCheck, Clock } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { providerService, ServiceInteraction } from "@/services/provider.service";

interface BookingsPageProps {
  color: string;
}

function money(value?: number | null) {
  return value == null ? "Price not set" : `K${value.toLocaleString()}`;
}

function formatWhen(item: ServiceInteraction) {
  if (!item.booking_date) return item.created_at ? new Date(item.created_at).toLocaleString() : "Date pending";
  const date = new Date(`${item.booking_date}T${item.start_time || "00:00"}`);
  return `${date.toLocaleDateString()}${item.start_time ? ` at ${item.start_time.slice(0, 5)}` : ""}`;
}

export function BookingsPage({ color }: BookingsPageProps) {
  const [bookings, setBookings] = useState<ServiceInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    providerService
      .listInteractions({ scope: "customer", type: "booking" })
      .then((res) => setBookings(res.data?.items ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load bookings."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="Bookings" subtitle="Your beauty service booking requests" color={color}>
      {error && <div className="mb-3 text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</div>}
      {loading && <div className="text-sm" style={{ color: "#8ca5bc" }}>Loading bookings...</div>}
      <div className="flex flex-col gap-3">
        {!loading && bookings.map((booking) => (
          <div key={booking.id} className="rounded-xl p-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <span className="text-sm font-semibold block truncate" style={{ color: "var(--text-primary, white)" }}>{booking.listing?.title || "Beauty service"}</span>
                <span className="text-[11px]" style={{ color: "#8ca5bc" }}>{booking.provider?.business_name || booking.provider?.display_name || "Provider"}</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                style={{ background: booking.status === "confirmed" ? "#10b98120" : "#f5ab2020", color: booking.status === "confirmed" ? "#10b981" : "#f5ab20" }}>
                {booking.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] mb-3" style={{ color: "#8ca5bc" }}>
              <Clock size={12} /> {formatWhen(booking)} · {money(booking.total_amount)}
            </div>
            {booking.notes && <p className="text-xs" style={{ color: "#cde0f0" }}>{booking.notes}</p>}
          </div>
        ))}
        {!loading && bookings.length === 0 && (
          <div className="rounded-xl p-8 flex flex-col items-center gap-2 text-center" style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}>
            <CalendarCheck size={28} />
            <p className="text-sm">No bookings yet.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
