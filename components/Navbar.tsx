// components/Navbar.tsx  – updated: sign-in/up open AuthModal or navigate depending on context
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/auth";

const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/#how", label: "How It Works" },
  { href: "/#about", label: "About" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn]     = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    setLoggedIn(!!getSession());
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    clearSession();
    setLoggedIn(false);
    router.push("/");
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-[10%] h-[68px] transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(13,31,45,0.97)] shadow-[0_4px_32px_rgba(0,0,0,0.4)]"
            : "bg-[rgba(13,31,45,0.92)]"
        } backdrop-blur-[16px] border-b border-[rgba(245,166,35,0.12)]`}
      >
        <Link href="/" className="font-black text-[1.25rem] text-white no-underline">
          Connect<span style={{ color: "#f5ab20" }}>MW</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8 list-none">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-[#cde0f0] no-underline text-sm font-medium transition-colors duration-200 hover:text-[#f5ab20]">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex gap-3 items-center">
          {loggedIn ? (
            <>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-5 py-2 rounded-full text-sm font-bold text-[#0d1f2d] bg-[#f5ab20] border-none transition-all duration-200 hover:bg-[#e8941a] hover:-translate-y-0.5 cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-full text-sm font-medium text-white border border-[rgba(255,255,255,0.25)] bg-transparent transition-all duration-200 hover:border-[#f5ab20] hover:text-[#f5ab20] cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/signin")}
                className="px-5 py-2 rounded-full text-sm font-medium text-white border border-[rgba(255,255,255,0.25)] bg-transparent transition-all duration-200 hover:border-[#f5ab20] hover:text-[#f5ab20] cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="px-5 py-2 rounded-full text-sm font-bold text-[#0d1f2d] bg-[#f5ab20] border-none transition-all duration-200 hover:bg-[#e8941a] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(245,166,35,0.35)] cursor-pointer"
              >
                Sign Up Free
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 cursor-pointer bg-transparent border-none p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`fixed top-[68px] left-0 right-0 z-[999] bg-[#132333] border-b border-[rgba(245,166,35,0.12)] transition-all duration-300 md:hidden ${mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
        <div className="px-[10%] py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-[#cde0f0] no-underline text-base font-medium py-2 border-b border-[rgba(255,255,255,0.06)] hover:text-[#f5ab20] transition-colors">
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 mt-2">
            {loggedIn ? (
              <>
                <button onClick={() => { router.push("/dashboard"); setMobileOpen(false); }} className="flex-1 px-4 py-2.5 rounded-full text-sm font-bold text-[#0d1f2d] bg-[#f5ab20] border-none cursor-pointer">Dashboard</button>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-white border border-[rgba(255,255,255,0.25)] bg-transparent cursor-pointer">Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={() => { router.push("/signin"); setMobileOpen(false); }} className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-white border border-[rgba(255,255,255,0.25)] bg-transparent cursor-pointer">Sign In</button>
                <button onClick={() => { router.push("/signup"); setMobileOpen(false); }} className="flex-1 px-4 py-2.5 rounded-full text-sm font-bold text-[#0d1f2d] bg-[#f5ab20] border-none cursor-pointer">Sign Up Free</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
