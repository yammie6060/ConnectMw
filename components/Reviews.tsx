"use client";

const reviews = [
  {
    stars: 5,
    text: "I found a spare part for my Toyota Corolla in under 10 minutes. The seller was 2km away. Before ConnectMW I would have wasted a whole day driving around Limbe market.",
    initials: "TM",
    name: "Tawonga Mbewe",
    role: "Car owner · Blantyre",
  },
  {
    stars: 5,
    text: "As a student coming from Zomba, finding a hostel in Blantyre was stressful. ConnectMW had verified listings with real photos and actual prices. I found my room in two days.",
    initials: "CN",
    name: "Chisomo Nyirenda",
    role: "Student · CBU",
  },
  {
    stars: 5,
    text: "I listed my salon on BeautyConnect and my bookings doubled in the first month. Clients can see my portfolio and book without calling me — it's changed my business completely.",
    initials: "FZ",
    name: "Fatuma Zimba",
    role: "Salon Owner · Lilongwe",
  },
  {
    stars: 4,
    text: "Managing my rental properties used to mean endless phone calls. Now tenants find me through HomeConnect, see the photos, and contact me already serious. Much better quality inquiries.",
    initials: "JK",
    name: "James Kachingwe",
    role: "Landlord · Mzuzu",
  },
  {
    stars: 5,
    text: "The Airtel Money integration is seamless. I paid my deposit and service fee right from the app. No running to ATMs, no cash risks. That alone makes ConnectMW worth it.",
    initials: "AM",
    name: "Annie Mhango",
    role: "Renter · Blantyre",
  },
];

export default function Reviews() {
  return (
    <section id="reviews" className="px-[10%] py-[100px] relative">
      {/* Header */}
      <div className="text-center max-w-[560px] mx-auto mb-14">
        <p className="text-[0.75rem] font-semibold tracking-[2px] uppercase text-[#f5ab20] mb-2">
          Testimonials
        </p>
        <h2
          className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-1px] leading-[1.15] mb-3"
         
        >
          What Malawians Are Saying
        </h2>
        <p className="text-[#cde0f0] font-light leading-[1.7] text-sm">
          Real people, real results. Connect<span style={{ color: "#f5ab20" }}>MW</span> is already changing how people
          access services across Malawi.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <ReviewCard key={r.name} {...r} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({
  stars,
  text,
  initials,
  name,
  role,
}: (typeof reviews)[0]) {
  return (
    <div
      className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
      style={{
        background: "#1a2e42",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="text-[#f5ab20] text-base tracking-[2px] mb-3">
        {"★".repeat(stars)}
        {"☆".repeat(5 - stars)}
      </div>

      <p className="text-[#cde0f0] text-sm italic font-light leading-[1.7] mb-5">
        &ldquo;{text}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        <div
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{
            background: "linear-gradient(135deg,#1b4f6a,#f5ab20)",
            color: "#0d1f2d",
          }}
        >
          {initials}
        </div>
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-[0.75rem] text-[#8ca5bc]">{role}</div>
        </div>
      </div>
    </div>
  );
}
