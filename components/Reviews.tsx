"use client";

import { useEffect, useState } from "react";
import { providerService, ProviderReview } from "@/services/provider.service";

function initialsFor(name?: string | null) {
  const parts = (name || "ConnectMW User").trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "CU";
}

function reviewerName(review: ProviderReview) {
  return review.reviewer?.full_name || review.reviewer?.email || "ConnectMW user";
}

function reviewRole(review: ProviderReview) {
  const date = review.created_at ? new Date(review.created_at).toLocaleDateString() : "Recently";
  return `Verified review - ${date}`;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    providerService
      .listReviews()
      .then((res) => setReviews(res.data?.items ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="reviews" className="px-[10%] py-[100px] relative">
      <div className="text-center max-w-[560px] mx-auto mb-14">
        <p className="text-[0.75rem] font-semibold tracking-[2px] uppercase text-[#f5ab20] mb-2">
          Testimonials
        </p>
        <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-1px] leading-[1.15] mb-3">
          What Customers Are Saying
        </h2>
        <p className="text-[#cde0f0] font-light leading-[1.7] text-sm">
          Real reviews from completed Connect<span style={{ color: "#f5ab20" }}>MW</span> bookings, orders, and enquiries.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-lg" style={{ background: "#1a2e42" }} />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-sm">
          Nothing yet
        </div>
      )}
    </section>
  );
}

function ReviewCard({ review }: { review: ProviderReview }) {
  const name = reviewerName(review);

  return (
    <div
      className="rounded-lg p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
      style={{
        background: "#1a2e42",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="text-[#f5ab20] text-base tracking-[2px] mb-3">
        {"★".repeat(review.rating)}
        {"☆".repeat(5 - review.rating)}
      </div>

      <p className="text-[#cde0f0] text-sm italic font-light leading-[1.7] mb-5">
        &ldquo;{review.comment || "Rated this provider after using the service."}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        <div
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{
            background: "linear-gradient(135deg,#1b4f6a,#f5ab20)",
            color: "#0d1f2d",
          }}
        >
          {initialsFor(name)}
        </div>
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-[0.75rem] text-[#8ca5bc]">{reviewRole(review)}</div>
        </div>
      </div>
    </div>
  );
}
