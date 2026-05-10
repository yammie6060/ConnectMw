// Services.tsx
"use client";

import { Banknote, Phone, ChevronLeft, ChevronRight, Home, Sparkles, Car, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const services = [
  {
    id: "homeconnect",
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
    href: "/services/homeconnect",
    cta: "Find your home →",
    images: [
      "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=900&h=700&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=700&h=460&fit=crop&auto=format&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&h=460&fit=crop&auto=format&q=85",
    ],
    color: "#f5ab20",
    icon: Home,
  },
  {
    id: "beautyconnect",
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
    href: "/services/beautyconnect",
    cta: "Book now →",
    images: [
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=900&h=700&fit=crop&auto=format&q=85",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=900&h=700&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=700&h=460&fit=crop&auto=format&q=85",
    ],
    color: "#f5ab20",
    icon: Sparkles,
  },
  {
    id: "sparefinder",
    title: "SpareFinder",
    desc: "Locate auto spares for minibuses, pickups, saloons, and tractors. Upload a photo — we find it near you from verified local dealers.",
    features: [
      "AI-powered photo matching",
      "Nearest-first results",
      "Seller chat & secure payments",
      "Minibus, pickup & saloon parts",
      "Delivery partnerships",
    ],
    tag: "Auto Spares & Vehicles",
    href: "/services/sparefinder",
    cta: "Find spares →",
    images: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&h=700&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=700&h=460&fit=crop&auto=format&q=85",
      "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=700&h=460&fit=crop&auto=format&q=85",
    ],
    color: "#f5ab20",
    icon: Car,
  },
];

const paymentMethods = [
  { icon: Phone, label: "Airtel Money", bgColor: "#c50610", textColor: "#ffffff", href: "/payments/airtel" },
  { icon: Phone, label: "TNM Mpamba", bgColor: "#00a859", textColor: "#ffffff", href: "/payments/mpamba" },
  { icon: Banknote, label: "Bank Transfer", bgColor: "#34a853", textColor: "#ffffff", href: "/payments/bank" },
  { icon: Banknote, label: "Cash on Delivery", bgColor: "#f5ab20", textColor: "#1a2e42", href: "/payments/cod" },
];

export default function Services() {
  const router = useRouter();

  const handlePaymentClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log(`Navigate to: ${href}`);
  };

  const handleServiceClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

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
        <span className="text-[0.75rem] text-[#8ca5bc] uppercase tracking-[1px] font-semibold">
          Secure payments via
        </span>
        <div className="flex gap-3 flex-wrap items-center">
          {paymentMethods.map((pm) => (
            <button
              key={pm.label}
              onClick={(e) => handlePaymentClick(pm.href, e)}
              className="text-[0.78rem] font-semibold px-3 py-1.5 rounded-lg inline-flex items-center transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
              style={{ 
                background: pm.bgColor, 
                color: pm.textColor, 
                border: "1px solid rgba(255,255,255,0.1)" 
              }}
            >
              {pm.icon && <pm.icon className="w-4 h-4 mr-2" />} {pm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services section */}
      <section id="services" className="px-[6%] pt-14 pb-[80px]" style={{ background: "#132333" }}>
        <div className="flex justify-between items-end flex-wrap gap-6 mb-10">
          <div>
            <p className="text-[0.75rem] font-semibold tracking-[2px] uppercase text-[#f5ab20] mb-2">
              What We Offer
            </p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-1px] leading-[1.15] text-white">
              Three Pillars.<br />One Platform.
            </h2>
          </div>
          <p className="text-[#cde0f0] font-light max-w-[540px] leading-[1.7] text-sm">
            Every service is verified, location-aware, and secured with transparent payments — no more WhatsApp guessing games.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc) => (
            <ServiceCard key={svc.id} {...svc} onServiceClick={handleServiceClick} />
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
  href,
  cta,
  icon: Icon,
  onServiceClick,
}: {
  title: string;
  desc: string;
  features: string[];
  tag: string;
  images: string[];
  color: string;
  href: string;
  cta: string;
  icon: React.ElementType;
  onServiceClick: (href: string, e: React.MouseEvent) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    setCurrent((idx + images.length) % images.length);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(current + 1);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(current - 1);
  };

  const goToSlide = (idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent(idx);
  };

  useEffect(() => {
    if (images.length <= 1) return;
    
    timerRef.current = setInterval(() => {
      if (!paused) {
        setCurrent((prev) => (prev + 1) % images.length);
      }
    }, 3000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [paused, images.length]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    onServiceClick(href, e);
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(0,0,0,0.4)] cursor-pointer"
      style={{ background: "#1a2e42", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={handleCardClick}
    >
      {/* Carousel */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="flex-shrink-0 w-full h-full">
              <img
                src={src}
                alt={`${title} - ${tag} - Image ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent 50%, #1a2e42 100%)" }}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-black/70 hover:scale-110 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-black/70 hover:scale-110 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => goToSlide(idx, e)}
                className={`transition-all duration-300 rounded-full ${
                  current === idx 
                    ? "w-5 h-1.5 bg-[#f5ab20]" 
                    : "w-1.5 h-1.5 bg-white/45 hover:bg-white/75"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          {Icon && <Icon className="w-5 h-5" style={{ color }} />}
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        
        <p className="text-[#cde0f0] text-sm leading-[1.6] font-light mb-4 line-clamp-2">
          {desc}
        </p>
        
        <ul className="mb-5 space-y-2">
          {features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-[0.82rem] text-[#8ca5bc]">
              <span className="text-[#f5ab20] font-bold flex-shrink-0 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-[0.7rem] font-semibold"
            style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}
          >
            {tag}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onServiceClick(href, e);
            }}
            className="text-xs font-medium transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-1 group/btn"
            style={{ color }}
          >
            {cta}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
}
