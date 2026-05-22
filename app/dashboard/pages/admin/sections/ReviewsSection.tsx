import React from "react";
import { Star } from "lucide-react";
import { ManagedReview } from "@/services/admin.service";

interface ReviewsSectionProps {
  reviews: ManagedReview[];
  color: string;
}

export function ReviewsSection({ reviews, color }: ReviewsSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-secondary, #132333)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <div
                className="font-bold truncate text-sm sm:text-base"
                style={{ color: "var(--text-primary, white)" }}
              >
                {review.provider.business_name || review.provider.display_name || "Provider"}
              </div>
              <div className="text-xs mt-0.5 break-words" style={{ color: "#8ca5bc" }}>
                {review.reviewer.email}
              </div>
            </div>
            <div className="flex gap-0.5 flex-shrink-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  fill={star <= review.rating ? color : "transparent"}
                  style={{ color }}
                />
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-sm mt-2 break-words" style={{ color: "#cde0f0" }}>
              {review.comment}
            </p>
          )}
        </div>
      ))}
      {reviews.length === 0 && (
        <div
          className="rounded-xl p-5 text-sm"
          style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc" }}
        >
          No reviews found.
        </div>
      )}
    </div>
  );
}