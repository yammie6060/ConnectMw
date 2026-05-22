import React from "react";

interface FeedbackBannerProps {
  message: string;
  isError: boolean;
  color: string;
}

export function FeedbackBanner({ message, isError, color }: FeedbackBannerProps) {
  if (!message) return null;
  
  return (
    <div
      className="rounded-xl px-4 py-3 mb-4 text-xs font-semibold"
      style={
        isError
          ? { background: "rgba(239,68,68,0.12)", color: "#fca5a5" }
          : { background: `${color}14`, color }
      }
    >
      {message}
    </div>
  );
}