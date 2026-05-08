"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import About from "@/components/About";
import Reviews from "@/components/Reviews";
import CTABanner from "@/components/CTABanner";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signup");

  const handleOpenAuthModal = (tab: "signin" | "signup") => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  return (
    <>
      <Navbar />
      <main>
        <Hero onOpenModal={handleOpenAuthModal} />
        <Services />
        <HowItWorks />
        <About />
        <Reviews />
        <CTABanner />
        <Contact />
      </main>
      <Footer />

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pt-[100px] overflow-y-auto"
          style={{ background: "rgba(13,31,45,0.95)" }}
          onClick={() => setShowAuthModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <AuthModal defaultTab={authModalTab} />
          </div>
        </div>
      )}
    </>
  );
}