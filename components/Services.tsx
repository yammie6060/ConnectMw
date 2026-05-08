"use client";

import { Banknote, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const services = [
  {
    title: "HomeConnect",
    desc: "Find verified houses, apartments, and student hostels across Malawi. Landlords list with photos, maps, and transparent pricing. No shady agents.",
    features: [
      "Verified landlords & agents",
      "Student hostel listings",
      "Virtual tours & photo galleries",
      "In-app contract templates",
      "Transparent commission fees",
    ],
    tag: "Rentals & Hostels",
    images: [
      "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop&auto=format",
    ],
    color: "#f5ab20",
  },
  {
    title: "BeautyConnect",
    desc: "Book salons, barbers, nail technicians, and makeup artists in seconds. Browse portfolios, check availability, and pay securely — no more no-shows.",
    features: [
      "Instant slot booking",
      "Before & after portfolios",
      "Ratings & reviews",
      "At-home service options",
      "Booking reminders",
    ],
    tag: "Beauty & Personal Care",
    images: [
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1633681926031-b8c1b69dc75f?w=600&h=400&fit=crop&auto=format",
    ],
    color: "#f5ab20",
  },
  {
    title: "SpareFinder",
    desc: "Locate auto spares locally with AI image matching. Upload a photo of your part — we scan listings and find it near you. Stop importing when it's around the corner.",
    features: [
      "AI-powered photo matching",
      "Nearest-first results",
      "Seller chat & secure payments",
      "Delivery partnerships",
      "Vehicle marketplace",
    ],
    tag: "Auto Spares & Vehicles",
    images: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1533473359331-fd322f5a7c29?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1552519507-88aa2dfa9fdb?w=600&h=400&fit=crop&auto=format",
    ],
    color: "#f5ab20",
  },
];

const paymentMethods = [
  { icon: Phone, label: "Airtel Money", bgColor: "#c50610", textColor: "#ffffff" },
  { icon: Phone, label: "TNM Mpamba", bgColor: "#00a859", textColor: "#ffffff" },
  { icon: Banknote, label: "Bank Transfer", bgColor: "#34a853", textColor: "#ffffff" },
  { icon: Banknote, label: "Cash on Delivery", bgColor: "#f5ab20", textColor: "#1a2e42" },
];

export default function Services() {
  return (
    <>
      {/* Payment strip */}
      <div
        className="flex items-center justify-center gap-12 flex-wrap px-[6%] py-5"
        style={{
          background: "#1a2e42",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span className="text-[0.75rem] text-[#8ca5bc] uppercase tracking-[1px]">
          Secure payments via
        </span>
        <div className="flex gap-3 flex-wrap items-center">
          {paymentMethods.map((pm) => (
            <span
              key={pm.label}
              className="text-[0.78rem] font-semibold px-3 py-1.5 rounded-lg inline-flex items-center"
              style={{
                background: pm.bgColor,
                color: pm.textColor,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {pm.icon && <pm.icon className="w-4 h-4 mr-2" />} {pm.label}
            </span>
          ))}
        </div>
      </div>

      {/* Services section */}
      <section
        id="services"
        className="px-[6%] py-[100px]"
        style={{ background: "#132333" }}
      >
        {/* Header */}
        <div className="flex justify-between items-end flex-wrap gap-6 mb-14">
          <div>
            <p className="text-[0.75rem] font-semibold tracking-[2px] uppercase text-[#f5ab20] mb-2">
              What We Offer
            </p>
            <h2
              className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-1px] leading-[1.15] text-white"
            >
              Three Pillars.
              <br />
              One Platform.
            </h2>
          </div>
          <p className="text-[#cde0f0] font-light max-w-[540px] leading-[1.7] text-sm">
            Every service is verified, location-aware, and secured with
            transparent payments — no more WhatsApp guessing games.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc) => (
            <ServiceCard key={svc.title} {...svc} />
          ))}
        </div>
      </section>
    </>
  );
}

function ServiceCard({
  title,
  desc,
  features,
  tag,
  images,
  color,
}: {
  title: string;
  desc: string;
  features: string[];
  tag: string;
  images: string[];
  color: string;
}) {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(0,0,0,0.4)] cursor-default"
      style={{
        background: "#1a2e42",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Image Carousel Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={images[currentImage]}
          alt={`${title} - ${currentImage + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient overlay on image */}
        <div
          className="absolute inset-0 bg-gradient-to-t"
          style={{
            background: `linear-gradient(to bottom, transparent 50%, #1a2e42 100%)`,
          }}
        />

        {/* Navigation Arrows - only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-black/70 hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-black/70 hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImage(idx);
                }}
                className={`transition-all duration-200 rounded-full ${
                  currentImage === idx
                    ? "w-6 h-1.5 bg-[#f5ab20]"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-6">
        {/* Title */}
        <h3
          className="text-xl font-bold mb-2 text-white"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-[#cde0f0] text-sm leading-[1.6] font-light mb-4">
          {desc}
        </p>

        {/* Features List */}
        <ul className="mb-5 space-y-2">
          {features.slice(0, 4).map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-[0.82rem] text-[#8ca5bc]"
            >
              <span className="text-[#f5ab20] font-bold flex-shrink-0 mt-0.5">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* Tag */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-[0.7rem] font-semibold"
            style={{
              background: `${color}20`,
              border: `1px solid ${color}40`,
              color: color,
            }}
          >
            {tag}
          </span>
          
          {/* Learn more link */}
          <a
            href="#"
            className="text-xs font-medium transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-1"
            style={{ color: color }}
          >
            Learn more 
            <span className="text-sm">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}