"use client";

import { Check } from "lucide-react";

const values = [
  {
    icon: Check,
    title: "Trust & Security First",
    desc: "Every provider is verified. Every payment is protected. We've eliminated the middlemen and scammers that cost Malawians daily.",
  },
  {
    icon: Check,
    title: "Location-Aware Technology",
    desc: "GPS-first search means you always see what's closest and most relevant. Perfect for Malawi's growing urban and peri-urban areas.",
  },
  {
    icon: Check,
    title: "Empowering Local Businesses",
    desc: "From sole-trader barbers to multi-property landlords — we give small Malawian businesses a professional digital presence and more customers.",
  },
];

const bigStats = [
  { num: "3", label: "Cities Covered" },
  { num: "3", label: "Service Verticals" },
  { num: "100+", label: "Connections Made" },
];

export default function About() {
  return (
    <section
      id="about"
      className="px-[10%] py-[10px]"
      style={{ background: "#132333" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left */}
        <div>
          <p className="text-[0.75rem] font-semibold tracking-[2px] uppercase text-[#f5ab20] mb-2">
            Who We Are
          </p>
          <h2
            className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-1px] leading-[1.15] mb-3"
          >
            Built by Malawians,
            <br />
            for Malawians
          </h2>
          <p className="text-[#cde0f0] font-light leading-[1.7] text-sm max-w-[540px]">
            Connect<span style={{ color: "#f5ab20" }}>MW</span> is a product of MiNDTech Company — a Malawian tech
            company with one mission: make everyday services accessible,
            trustworthy, and efficient for every citizen.
          </p>

          <div className="flex flex-col gap-4 mt-8">
            {values.map((v) => (
              <div
                key={v.title}
                className="flex items-start gap-4 p-5 rounded-xl transition-all duration-250 hover:border-[rgba(245,166,35,0.25)]"
                style={{
                  background: "#1a2e42",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="text-[1.35rem] flex-shrink-0 mt-0.5">
                  <v.icon size={20} strokeWidth={2} />
                </div>
                <div>
                  <div
                    className="font-bold text-sm mb-1"
                   
                  >
                    {v.title}
                  </div>
                  <div className="text-[0.83rem] text-[#cde0f0] font-light leading-[1.6]">
                    {v.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          <p className="text-[0.75rem] font-semibold tracking-[2px] uppercase text-[#f5ab20] mb-2">
            Our Mission
          </p>
          <h3
            className="text-[1.6rem] font-bold tracking-[-1px] leading-[1.15] mb-3"
           
          >
            &ldquo;Digital Mind.
            <br />
            Reliable Technology.&rdquo;
          </h3>
          <p className="text-[#cde0f0] font-light leading-[1.7] text-sm max-w-[540px]">
            We believe every Malawian deserves access to reliable services
            without the chaos of scattered markets, unreliable agents, or
            word-of-mouth guesswork. ConnectMW is the infrastructure that
            changes that.
          </p>

          {/* Big stat box */}
          <div
            className="flex gap-10 flex-wrap rounded-2xl p-8 mt-8"
            style={{
              background: "linear-gradient(135deg,#1b4f6a,#1a2e42)",
              border: "1px solid rgba(245,166,35,0.12)",
            }}
          >
            {bigStats.map((s) => (
              <div key={s.label}>
                <div
                  className="text-[2.2rem] font-black"
                  style={{ fontFamily: " sans-serif", color: "#f5ab20" }}
                >
                  {s.num}
                </div>
                <div className="text-[0.78rem] text-[#cde0f0] mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[0.82rem] text-[#8ca5bc] leading-[1.7]">
            We started with Blantyre and are rapidly expanding to Lilongwe and
            Mzuzu. A mobile app is in development. If you want to partner with
            us or list your business,{" "}
            <a
              href="#contact"
              className="no-underline hover:underline"
              style={{ color: "#f5ab20" }}
            >
              contact us today.
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
