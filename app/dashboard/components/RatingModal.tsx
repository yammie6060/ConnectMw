import { useState } from "react";
import { Star, X } from "lucide-react";
import { ServiceInteraction } from "@/services/provider.service";

type RatingModalProps = {
  color: string;
  interaction: ServiceInteraction | null;
  targetLabel: string;
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
};

export function RatingModal({
  color,
  interaction,
  targetLabel,
  submitting,
  error,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!interaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-3 py-4">
      <div
        className="w-full max-w-md rounded-2xl p-5 shadow-2xl"
        style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.12)" }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="text-lg font-black" style={{ color: "var(--text-primary, white)" }}>
              Rate {targetLabel}
            </h2>
            <p className="text-xs mt-1 truncate" style={{ color: "#8ca5bc" }}>
              {interaction.listing?.title || "Completed transaction"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 hover:bg-white/5"
            style={{ color: "#8ca5bc" }}
            aria-label="Close rating modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex justify-center gap-1.5 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
              aria-label={`${star} star rating`}
            >
              <Star size={24} fill={star <= rating ? color : "transparent"} style={{ color }} />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          className="w-full rounded-xl px-3 py-3 text-sm outline-none resize-none"
          style={{
            background: "var(--bg-elevated, #1a2e42)",
            color: "var(--text-primary, white)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          placeholder="Add a comment"
        />

        {error && <div className="mt-3 text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</div>}

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold"
            style={{ background: "transparent", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Later
          </button>
          <button
            disabled={submitting}
            onClick={() => onSubmit(rating, comment.trim())}
            className="flex-1 py-2.5 rounded-xl text-xs font-black disabled:opacity-60"
            style={{ background: color, color: "#0d1f2d" }}
          >
            {submitting ? "Submitting..." : "Submit rating"}
          </button>
        </div>
      </div>
    </div>
  );
}
