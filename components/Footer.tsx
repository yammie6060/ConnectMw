"use client";

const footerLinks = {
  Services: ["HomeConnect", "BeautyConnect", "SpareFinder", "List Your Business"],
  Company: ["About Us", "MiNDTech Company", "Careers", "Press & Media", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Provider Agreement"],
};

const socials = [
  { 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z"/>
      </svg>
    ),
    label: "Facebook",
    color: "#1877f2",
  },
  { 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    label: "X (Twitter)",
    color: "#ffffff",
  },
  { 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    label: "Instagram",
    color: "#e4405f",
  },
  { 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/>
      </svg>
    ),
    label: "LinkedIn",
    color: "#0a66c2",
  },
{
  icon: (
    <svg
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.52 0 .2 5.3.2 11.84c0 2.08.54 4.12 1.58 5.92L0 24l6.42-1.68a11.8 11.8 0 005.62 1.44h.01c6.52 0 11.84-5.3 11.84-11.84 0-3.16-1.24-6.12-3.37-8.44zM12.05 21.7a9.8 9.8 0 01-5-1.37l-.36-.22-3.8 1 1.02-3.7-.24-.38a9.73 9.73 0 01-1.5-5.2c0-5.4 4.4-9.8 9.82-9.8 2.62 0 5.08 1.02 6.92 2.87a9.72 9.72 0 012.88 6.92c0 5.42-4.4 9.82-9.82 9.82zm5.38-7.36c-.3-.14-1.76-.87-2.03-.96-.27-.1-.47-.14-.67.14-.2.3-.77.96-.95 1.16-.17.2-.35.23-.65.08-.3-.14-1.25-.46-2.38-1.48-.88-.78-1.47-1.74-1.64-2.03-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.52-.08-.14-.67-1.6-.92-2.2-.24-.58-.5-.5-.67-.5h-.57c-.2 0-.52.08-.8.38-.27.3-1.03 1-1.03 2.44s1.05 2.82 1.2 3.02c.15.2 2.05 3.14 4.96 4.4.7.3 1.25.48 1.67.62.7.22 1.33.2 1.83.12.56-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
    </svg>
  ),
  label: "WhatsApp",
  color: "#25D366",
}
];

export default function Footer() {
  return (
    <footer
      className="px-[6%] pt-[60px] pb-8"
      style={{
        background: "#0d1f2d",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div className="lg:col-span-1">
          <a
            href="#home"
            className="font-black text-[1.25rem] text-white no-underline block mb-3"
            style={{ fontFamily: " sans-serif" }}
          >
            Connect<span style={{ color: "#f5ab20" }}>MW</span>
          </a>
          <p className="text-sm text-[#8ca5bc] leading-[1.7] max-w-[280px]">
            Malawi&apos;s all-in-one platform for rentals, beauty services, and
            auto spares. Verified. Secure. Local.
          </p>
          <div className="flex gap-3 mt-5 flex-wrap">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:-translate-y-0.5 hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: s.color,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = s.color;
                  (e.currentTarget as HTMLElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.color = s.color;
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4
              className="font-bold text-sm text-white mb-4"
              style={{ fontFamily: " sans-serif" }}
            >
              {heading}
            </h4>
            <ul className="list-none flex flex-col gap-2">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-[0.83rem] text-[#8ca5bc] no-underline transition-all duration-200 hover:text-[#f5ab20] hover:translate-x-1 inline-block"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="flex flex-wrap justify-between items-center gap-4 pt-6 text-[0.78rem] text-[#8ca5bc]"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span>
          &copy; {new Date().getFullYear()} Connect<span style={{ color: "#f5ab20" }}>MW</span> · MiNDTech Company · All rights reserved
        </span>
        <span className="text-[#f5ab20] flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
          Made by Malawians 🇲🇼
        </span>
      </div>
    </footer>
  );
}