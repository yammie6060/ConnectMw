"use client";

import { useRouter } from "next/navigation";

export default function CTABanner() {
  const router = useRouter();

  return (
    <div
      className="relative text-center px-[10%] py-[80px] overflow-hidden"
      style={{
        background: "linear-gradient(135deg,#1b4f6a 0%,#132333 100%)",
        borderTop: "1px solid rgba(245,166,35,0.12)",
        borderBottom: "1px solid rgba(245,166,35,0.12)",
      }}
    >
      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(245,166,35,.08),transparent 70%)",
        }}
      />

      <div className="relative z-10">
        <p className="text-[0.75rem] font-semibold tracking-[2px] uppercase text-[#f5ab20] mb-3">
          Get Started
        </p>
        <h2
          className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-1px] leading-[1.15] max-w-[600px] mx-auto mb-3"
        >
          Ready to Connect with Malawi?
        </h2>
        <p className="text-[#cde0f0] font-light max-w-[540px] mx-auto mb-8 text-sm leading-[1.7]">
          Whether you&apos;re looking for a home, a haircut, or a hard-to-find spare
          part — Connect<span style={{ color: "#f5ab20" }}>MW</span> has you
          covered. Join thousands of Malawians already on the platform.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => router.push("/signup")}
            className="px-10 py-3.5 rounded-full text-base font-bold text-[#0d1f2d] bg-[#f5ab20] border-none cursor-pointer transition-all duration-200 hover:bg-[#e8941a] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(245,166,35,0.35)]"
          >
            Create Free Account →
          </button>
          <a
            href="#services"
            className="px-8 py-3.5 rounded-full text-base font-medium text-white bg-transparent border border-[rgba(255,255,255,0.25)] no-underline transition-all duration-200 hover:border-[#f5ab20] hover:text-[#f5ab20]"
          >
            See All Services
          </a>
        </div>
      </div>
    </div>
  );
}