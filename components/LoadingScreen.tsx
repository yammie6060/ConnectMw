"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  minDisplayTime?: number; 
  onLoadingComplete?: () => void;
}

export function LoadingScreen({ minDisplayTime = 5000, onLoadingComplete }: LoadingScreenProps) {
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(false);
      onLoadingComplete?.();
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onLoadingComplete]);

  if (!shouldShow) return null;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0b1c2c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes cmw-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes cmw-breathe {
          0%,100% { opacity:.12; transform:scale(1); }
          50%      { opacity:.28; transform:scale(1.18); }
        }
        @keyframes cmw-breathe2 {
          0%,100% { opacity:.07; transform:scale(1); }
          50%      { opacity:.16; transform:scale(1.32); }
        }
        @keyframes cmw-logoIn {
          from { opacity:0; transform:scale(.7); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes cmw-tagIn {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cmw-barGrow {
          from { transform:scaleX(0); }
          to   { transform:scaleX(1); }
        }
        @keyframes cmw-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Orbital ring + logo */}
        <div style={{ position: "relative", width: 110, height: 110, marginBottom: 28 }}>
          {/* Pulse rings */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "1px solid #f5ab20", opacity: .12,
            animation: "cmw-breathe2 3s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", inset: 10, borderRadius: "50%",
            border: "1px solid #f5ab20", opacity: .15,
            animation: "cmw-breathe 2.6s ease-in-out infinite .3s",
          }} />

          {/* Spinning arc */}
          <svg
            style={{ position: "absolute", inset: 18, animation: "cmw-spin 2.2s linear infinite" }}
            viewBox="0 0 74 74"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="37" cy="37" r="34"
              stroke="#f5ab20" strokeWidth="1.5"
              strokeDasharray="60 154" strokeLinecap="round"
              opacity=".9"
            />
            <circle
              cx="37" cy="37" r="34"
              stroke="#1b6f9a" strokeWidth="1.5"
              strokeDasharray="30 184" strokeDashoffset={-80}
              strokeLinecap="round" opacity=".6"
            />
          </svg>

          {/* Logo mark */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "cmw-logoIn .6s cubic-bezier(.34,1.56,.64,1) both .2s",
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: ".5px", color: "#fff" }}>
              C<span style={{ color: "#f5ab20" }}>MW</span>
            </span>
          </div>
        </div>

        {/* Brand name */}
        <p style={{
          margin: 0, fontSize: 13, color: "rgba(255,255,255,.35)",
          letterSpacing: ".12em", textTransform: "uppercase",
          animation: "cmw-tagIn .5s ease both .5s", opacity: 0,
        }}>
          ConnectMW
        </p>

        {/* Progress bar with percentage */}
        <div style={{
          marginTop: 32, width: 180, height: 2,
          background: "rgba(255,255,255,.07)", borderRadius: 2, overflow: "hidden",
          animation: "cmw-tagIn .4s ease both .7s", opacity: 0,
        }}>
          <div style={{
            height: "100%", width: "100%",
            background: "#f5ab20", borderRadius: 2,
            transformOrigin: "left",
            animation: "cmw-barGrow 5s cubic-bezier(.4,0,.2,1) both",
            transform: "scaleX(0)", opacity: .7,
          }} />
        </div>

        {/* Loading messages */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{
            fontSize: 12,
            color: "rgba(255,255,255,.5)",
            letterSpacing: "0.3px",
            animation: "cmw-pulse 2s ease-in-out infinite",
          }}>
            Loading your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}