import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { SessionUser } from "../types/dashboard";
import { providerService, ServiceInteraction } from "@/services/provider.service";
import { RatingModal } from "../components/RatingModal";

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
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [ratingTarget, setRatingTarget] = useState<ServiceInteraction | null>(null);
  const [ratingError, setRatingError] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState<Record<string, boolean>>({});
  const [submittingRating, setSubmittingRating] = useState(false);

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

  const updateStatus = async (booking: ServiceInteraction, status: string) => {
    setUpdatingId(booking.id);
    setError("");
    try {
      const res = await providerService.updateInteractionStatus("booking", booking.id, status);
      if (res.data) {
        setBookings((current) => current.map((item) => item.id === booking.id ? res.data! : item));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  const submitBuyerRating = async (rating: number, comment: string) => {
    if (!ratingTarget) return;
    setSubmittingRating(true);
    setRatingError("");
    try {
      await providerService.createReview({
        interaction_type: "booking",
        interaction_id: ratingTarget.id,
        target_type: "buyer",
        rating,
        comment,
      });
      setRatingSubmitted((current) => ({ ...current, [ratingTarget.id]: true }));
      setRatingTarget(null);
    } catch (err) {
      setRatingError(err instanceof Error ? err.message : "Could not submit rating.");
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <PageShell
      title={role === "beautyProvider" ? "Schedule" : "Calendar"}
      subtitle="Upcoming bookings from customers"
      color={color}
    >
      {/* Day strip */}
      <div className="rounded-xl p-2 mb-4 flex gap-1 overflow-x-auto scrollbar-none bg-[#132333] border border-white/7">
        {days.map((date) => {
          const value = date.toISOString().slice(0, 10);
          const active = selectedDate === value;
          return (
            <button
              key={value}
              onClick={() => setSelectedDate(value)}
              className={`min-w-[44px] flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                active ? "text-[#0d1f2d]" : "text-[#8ca5bc]"
              }`}
              style={{ background: active ? color : "transparent" }}
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
        <div className="mb-3 text-xs font-semibold text-red-500">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-sm text-[#8ca5bc]">
          Loading schedule...
        </div>
      )}

      {/* Section label */}
      <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3 text-[#8ca5bc]">
        Bookings
      </h3>

      {/* Booking cards */}
      <div className="flex flex-col gap-2">
        {!loading &&
          selectedEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-xl p-3 sm:p-4 transition-all hover:-translate-y-0.5 bg-[#132333] border border-white/7"
            >
              <div className="flex items-center gap-2 sm:gap-3">
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
                  <div className="text-xs sm:text-sm font-semibold truncate text-white">
                    {event.listing?.title || "Beauty booking"}
                  </div>
                  <div className="text-[11px] mt-0.5 truncate text-[#8ca5bc]">
                    {event.customer?.full_name ||
                      event.customer?.email ||
                      "Customer"}{" "}
                    · {eventTime(event)}
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize max-w-[80px] truncate bg-[#f5ab20]/[0.125] text-[#f5ab20] border border-[#f5ab20]/25"
                >
                  {event.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pl-3">
                {["confirmed", "rejected", "in_progress", "completed", "cancelled"].map((nextStatus) => (
                  <button
                    key={nextStatus}
                    disabled={updatingId === event.id || event.status === nextStatus}
                    onClick={() => updateStatus(event, nextStatus)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold capitalize disabled:opacity-50 ${
                      event.status === nextStatus ? "text-emerald-500 bg-emerald-500/20 border border-emerald-500/25" : ""
                    }`}
                    style={{
                      ...(event.status !== nextStatus && {
                        background: `${color}14`,
                        color: color,
                        border: `1px solid ${color}30`,
                      }),
                    }}
                  >
                    {updatingId === event.id ? "Updating..." : nextStatus.replace("_", " ")}
                  </button>
                ))}
                {event.status === "completed" && !ratingSubmitted[event.id] && (
                  <button
                    onClick={() => setRatingTarget(event)}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                    style={{
                      background: `${color}14`,
                      color: color,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    Rate buyer
                  </button>
                )}
              </div>
            </div>
          ))}

        {/* Empty state */}
        {!loading && selectedEvents.length === 0 && (
          <div className="rounded-xl p-8 flex flex-col items-center gap-2 text-center bg-[#132333] text-[#8ca5bc] border border-white/7">
            <CalendarDays size={26} />
            <p className="text-sm">No bookings for this day.</p>
          </div>
        )}
      </div>
      <RatingModal
        color={color}
        interaction={ratingTarget}
        targetLabel={ratingTarget?.customer?.full_name || ratingTarget?.customer?.email || "buyer"}
        submitting={submittingRating}
        error={ratingError}
        onClose={() => setRatingTarget(null)}
        onSubmit={submitBuyerRating}
      />
    </PageShell>
  );
}