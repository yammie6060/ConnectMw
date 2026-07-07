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

export default function About() {
  return (
    <section
      id="about"
      className="px-[10%] py-[10px]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left Column - Text Content */}
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
            Connect<span >MW</span> is a product of DigiRise Limited — a Malawian tech
            company with one mission: make everyday services accessible,
            trustworthy, and efficient for every citizen.
          </p>
        </div>

        {/* Right Column - Cards */}
        <div className="flex flex-col gap-4">
          {values.map((v) => (
            <div
              key={v.title}
              className="flex items-start gap-4 p-5 rounded-xl transition-all duration-250 hover:border-[rgba(245,166,35,0.25)]"
            >
              <div className="text-[1.35rem] flex-shrink-0 mt-0.5">
                <v.icon size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="font-bold text-sm mb-1">
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
    </section>
  );
}