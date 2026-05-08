"use client";

const services = [
  {
    emoji: "🏠",
    title: "HomeConnect",
    desc: "Find verified houses, apartments, and student hostels across Malawi. Landlords list with photos, maps, and transparent pricing. No shady agents.",
    features: [
      "Verified landlords & agents",
      "Student hostel listings",
      "Virtual tours & photo galleries",
      "In-app contract templates",
      "Transparent commission fees",
    ],
    tag: "🏘 Rentals & Hostels",
    image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&h=400&fit=crop&auto=format",
    color: "#f5ab20",
  },
  {
    emoji: "💅",
    title: "BeautyConnect",
    desc: "Book salons, barbers, nail technicians, and makeup artists in seconds. Browse portfolios, check availability, and pay securely — no more no-shows.",
    features: [
      "Instant slot booking",
      "Before & after portfolios",
      "Ratings & reviews",
      "At-home service options",
      "Booking reminders",
    ],
    tag: "✂ Beauty & Personal Care",
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=400&fit=crop&auto=format",
    color: "#f5ab20",
  },
  {
    emoji: "🔧",
    title: "SpareFinder",
    desc: "Locate auto spares locally with AI image matching. Upload a photo of your part — we scan listings and find it near you. Stop importing when it's around the corner.",
    features: [
      "AI-powered photo matching",
      "Nearest-first results",
      "Seller chat & secure payments",
      "Delivery partnerships",
      "Vehicle marketplace",
    ],
    tag: "🚗 Auto Spares & Vehicles",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop&auto=format",
    color: "#f5ab20",
  },
];

const paymentMethods = [
  { icon: "📱", label: "Airtel Money" },
  { icon: "📲", label: "TNM Mpamba" },
  { icon: "🏦", label: "Bank Transfer" },
  { icon: "💵", label: "Cash on Delivery" },
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
              className="text-[0.78rem] font-semibold text-[#cde0f0] px-3 py-1.5 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {pm.icon} {pm.label}
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
  emoji,
  title,
  desc,
  features,
  tag,
  image,
  color,
}: (typeof services)[0]) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(0,0,0,0.4)] cursor-default"
      style={{
        background: "#1a2e42",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay on image */}
        <div
          className="absolute inset-0 bg-gradient-to-t"
          style={{
            background: `linear-gradient(to bottom, transparent 50%, #1a2e42 100%)`,
          }}
        />
        {/* Emoji badge on image */}
        <div
          className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-xl backdrop-blur-md"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {emoji}
        </div>
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