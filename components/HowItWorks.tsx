"use client";

const steps = [
  {
    num: "01",
    title: "Create Your Account",
    desc: "Sign up free as a customer or service provider. Verification is quick and keeps our platform trustworthy for everyone.",
  },
  {
    num: "02",
    title: "Browse or List Services",
    desc: "Search for rentals, beauty bookings, or auto spares near you — or list your own property, salon, or shop for free.",
  },
  {
    num: "03",
    title: "Connect & Transact",
    desc: "Chat directly with providers, book appointments, or agree on purchases — all within the platform.",
  },
  {
    num: "04",
    title: "Pay Securely",
    desc: "Use Airtel Money, TNM Mpamba, or bank transfer. Our transparent fee structure means no hidden surprises.",
  },
  {
    num: "05",
    title: "Rate & Review",
    desc: "Leave honest reviews after every transaction. Your feedback makes ConnectMW better for all Malawians.",
  },
];

const mockItems = [
  {
    name: "2-Bed Flat, Blantyre",
    sub: "Verified · 0.8km away",
    price: "K45,000/mo",
  },
  {
    name: "Grace Nails Studio",
    sub: "★ 4.9 · Available today",
    price: "K3,500",
  },
  {
    name: "Toyota Vitz – Side Mirror",
    sub: "Matched via photo · 1.2km",
    price: "K12,000",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="px-[6%] py-[100px] relative">
      <p className="text-[0.75rem] font-semibold tracking-[2px] uppercase text-[#f5ab20] mb-2">
        Simple Process
      </p>
      <h2
        className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-1px] leading-[1.15] mb-14"
       
      >
        How <span className="text-[1.4rem] font-bold">Connect<span style={{ color: "#f5ab20" }}>MW</span></span> Works
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Steps */}
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="group flex gap-5 py-7 border-b border-[rgba(255,255,255,0.06)] last:border-b-0"
            >
              <div
                className="w-[42px] h-[42px] flex-shrink-0 rounded-full flex items-center justify-center text-sm font-black text-[#f5ab20] transition-all duration-250 group-hover:bg-[#f5ab20] group-hover:text-[#0d1f2d]"
                style={{
                  fontFamily: " sans-serif",
                  background: "rgba(245,166,35,0.12)",
                  border: "1.5px solid rgba(245,166,35,0.3)",
                }}
              >
                {step.num}
              </div>
              <div>
                <strong
                  className="block font-bold text-base mb-1"
                 
                >
                  {step.title}
                </strong>
                <p className="text-[#cde0f0] text-sm font-light leading-[1.6]">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Phone mockup */}
        <div
          className="relative rounded-[20px] p-8 overflow-hidden"
          style={{
            background: "#1a2e42",
            border: "1px solid rgba(245,166,35,0.12)",
          }}
        >
          {/* Glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-80px",
              right: "-80px",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(245,166,35,.08) 0%,transparent 70%)",
            }}
          />

          <div
            className="relative z-10 rounded-[24px] p-6"
            style={{
              background: "#132333",
              border: "1.5px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Header */}
            <div
              className="flex justify-between items-center mb-5 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span
                className="font-bold text-[0.95rem]"
               
              >
                Connect<span style={{ color: "#f5ab20" }}>MW</span>
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(52,168,83,0.15)",
                  color: "#5be87a",
                  border: "1px solid rgba(52,168,83,0.25)",
                }}
              >
                ● Live
              </span>
            </div>

            {/* Items */}
            {mockItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 p-3 rounded-[10px] mb-2.5"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
            
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-[#8ca5bc]">{item.sub}</div>
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{
                    fontFamily: " sans-serif",
                    color: "#f5ab20",
                  }}
                >
                  {item.price}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div
              className="flex justify-between items-center mt-4 pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span className="text-xs text-[#8ca5bc]">
                Secure via Airtel Money
              </span>
              <span className="text-xs font-semibold" style={{ color: "#5be87a" }}>
                ✓ Payment protected
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
