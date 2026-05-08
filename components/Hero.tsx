// Hero.tsx
"use client";

import { useState, useEffect } from "react";

interface HeroProps {
  onOpenModal: (tab: "signin" | "signup") => void;
}

const slides = [
  {
    image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=900&h=700&fit=crop&auto=format",
    tag: "HomeConnect",
    title: "Find Your Perfect Home",
    description: "Browse verified rentals, student hostels, and furnished apartments across Malawi.",
    cta: "Browse Rentals",
    accent: "#f5ab20",
  },
  {
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=900&h=700&fit=crop&auto=format&q=85",
    tag: "BeautyConnect",
    title: "Book Top Salons & Barbers",
    description: "Discover trusted salons, nail techs, and barbers near you. Book instantly.",
    cta: "Book a Session",
    accent: "#f5ab20",
  },
  {
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=700&h=460&fit=crop&auto=format&q=85",
    tag: "SpareFinder",
    title: "AI-Matched Auto Parts",
    description: "Find the right spare parts from verified local dealers — minibuses, pickups, saloons.",
    cta: "Find Parts",
    accent: "#f5ab20",
  },
];

const stats = [
  { num: "3+", label: "Services" },
  { num: "3", label: "Cities" },
  { num: "0%", label: "Fees" },
  { num: "24/7", label: "Access" },
];

export default function Hero({ onOpenModal }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  function goTo(indexOrUpdater: number | ((prev: number) => number)) {
    setAnimating(true);
    setTimeout(() => {
      setCurrent((prev) =>
        typeof indexOrUpdater === "function" ? indexOrUpdater(prev) : indexOrUpdater
      );
      setAnimating(false);
    }, 400);
  }

  const slide = slides[current];

  return (
    <section
      id="home"
      className="relative flex flex-col lg:flex-row items-stretch py-20 overflow-hidden bg-[#0d1f2d]"
    >
      {/* ── LEFT PANEL ── */}
      <div className="relative z-10 flex flex-col justify-center px-[10%] pt-[100px] pb-20 w-full lg:w-1/2 flex-shrink-0">
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-200px", left: "-200px",
            width: "600px", height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(27,79,106,.45) 0%,transparent 70%)",
          }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 w-fit"
          style={{
            background: "rgba(245,166,35,0.12)",
            border: "1px solid rgba(245,166,35,0.3)",
            animation: "fadeUp 0.6s ease both",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#f5ab20]" style={{ animation: "pulse2 1.8s infinite" }} />
          <span className="text-[#f5ab20] text-xs font-semibold tracking-widest uppercase">Live in Malawi</span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl font-black leading-[1.1] tracking-[-1px] mb-4 text-white"
          style={{ animation: "fadeUp 0.7s 0.1s ease both", opacity: 0, animationFillMode: "forwards" }}
        >
          Malawi&apos;s{" "}
          <em className="not-italic" style={{ color: "#f5ab20" }}>All-in-One</em>
          <br />Local Services Hub
        </h1>

        <p
          className="text-[#cde0f0] text-base font-light max-w-[480px] leading-relaxed mb-8"
          style={{ animation: "fadeUp 0.7s 0.2s ease both", opacity: 0, animationFillMode: "forwards" }}
        >
          Find rentals, book beauty services, and discover auto spares — all from a single trusted platform.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap gap-4 mb-12"
          style={{ animation: "fadeUp 0.7s 0.3s ease both", opacity: 0, animationFillMode: "forwards" }}
        >
          <a
            href="#services"
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-sm font-bold text-[#0d1f2d] bg-[#f5ab20] no-underline transition-all duration-200 hover:bg-[#e8941a] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(245,166,35,0.35)]"
          >
            Explore →
          </a>
          <button
            onClick={() => onOpenModal("signup")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-white bg-transparent border border-[rgba(255,255,255,0.25)] transition-all duration-200 hover:border-[#f5ab20] hover:text-[#f5ab20] cursor-pointer"
          >
            Join Free
          </button>
        </div>

        {/* Stats */}
        <div
          className="flex flex-wrap gap-8 pt-6 border-t border-[rgba(255,255,255,0.08)]"
          style={{ animation: "fadeUp 0.7s 0.4s ease both", opacity: 0, animationFillMode: "forwards" }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-black" style={{ color: "#f5ab20" }}>{s.num}</div>
              <div className="text-[0.7rem] text-[#8ca5bc] mt-0.5 tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (desktop) ── */}
      <div className="hidden lg:flex items-center justify-center w-1/2 p-8 relative">
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{ maxWidth: "600px", maxHeight: "500px" }}
        >
          <img
            key={current}
            src={slide.image}
            alt={slide.tag}
            className="w-full h-full object-cover"
            style={{
              opacity: animating ? 0 : 1,
              transition: "opacity 0.4s ease",
              aspectRatio: "4/3",
            }}
          />

          {/* Always-on dark overlay — strong enough for any image */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(13,31,45,0.92) 0%, rgba(13,31,45,0.45) 50%, rgba(13,31,45,0.25) 100%)",
            }}
          />

          {/* Overlay content */}
          <div
            className="absolute bottom-0 left-0 right-0 p-6"
            style={{ opacity: animating ? 0 : 1, transition: "opacity 0.4s ease" }}
          >
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2 text-[10px] font-bold tracking-wider uppercase"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                color: "#f5ab20",
              }}
            >
              {slide.tag}
            </div>
            <h2 className="text-white text-base font-black leading-tight mb-1.5 tracking-tight">
              {slide.title}
            </h2>
            <p className="text-[#cde0f0] text-[11px] leading-relaxed max-w-[340px] mb-3 font-light opacity-90">
              {slide.description}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="#services"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold no-underline transition-all duration-200 hover:-translate-y-0.5 bg-[#f5ab20] text-[#0d1f2d]"
                style={{ boxShadow: "0 2px 8px rgba(245,171,32,0.4)" }}
              >
                {slide.cta} →
              </a>
              <div className="flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="transition-all duration-300 rounded-full border-0 cursor-pointer"
                    style={{
                      width: i === current ? "16px" : "4px",
                      height: "4px",
                      background:
                        i === current ? "#f5ab20" : "rgba(255,255,255,0.35)",
                      padding: 0,
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Counter */}
          <div
            className="absolute top-3 right-3 text-[10px] font-bold tracking-wider bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            {String(current + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
          </div>

          {/* Arrow nav */}
          <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col gap-1.5">
            <button
              onClick={() => goTo((current - 1 + slides.length) % slides.length)}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border-0 cursor-pointer bg-black/50 backdrop-blur-sm text-white text-xs"
              aria-label="Previous slide"
            >
              ↑
            </button>
            <button
              onClick={() => goTo((current + 1) % slides.length)}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border-0 cursor-pointer bg-black/50 backdrop-blur-sm text-white text-xs"
              aria-label="Next slide"
            >
              ↓
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE background — images visible WITH dark overlay ── */}
      <div className="lg:hidden absolute inset-0 -z-0">
        <img
          key={current}
          src={slide.image}
          alt={slide.tag}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: animating ? 0 : 1, transition: "opacity 0.4s ease" }}
        />
        {/* Dark overlay so text stays readable on any image */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(13,31,45,0.78)" }}
        />
      </div>

      {/* Mobile slide dots */}
      <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all duration-300 rounded-full border-0 cursor-pointer"
            style={{
              width: i === current ? "20px" : "5px",
              height: "5px",
              background: i === current ? "#f5ab20" : "rgba(255,255,255,0.4)",
              padding: 0,
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse2 {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </section>
  );
}