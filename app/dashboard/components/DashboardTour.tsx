"use client";

import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { Bell, ChevronLeft, ChevronRight, Compass, PanelBottom, PanelLeft, Sparkles, UserCircle, X } from "lucide-react";
import { NavItem, NavMode } from "../types/dashboard";

const NAV_PROMPT_DISMISSED_KEY = "connectmw_nav_prompt_dismissed";
const NAV_PROMPT_AUTO_HIDE_MS = 120000;


type TourStep = {
  title: string;
  text: string;
  targetId?: string;
  icon: ElementType;
};

interface DashboardTourProps {
  navMode: NavMode;
  isMobile: boolean;
  hasSavedNavMode: boolean;
  color: string;
  navItems: NavItem[];
  onNavigate: (id: string) => void;
  onSwitchNavMode: (mode: NavMode) => void;
  onShowUserMenu: () => void;
}

export function DashboardTour({
  navMode,
  isMobile,
  hasSavedNavMode,
  color,
  navItems,
  onNavigate,
  onSwitchNavMode,
  onShowUserMenu,
}: DashboardTourProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo<TourStep[]>(() => {
    const moduleSteps = navItems.map((item) => ({
      title: item.label,
      text: `This opens the ${item.label.toLowerCase()} module so you can manage that part of your account.`,
      targetId: item.id,
      icon: item.icon,
    }));

    return [
      {
        title: "Navigation layout",
        text: isMobile
          ? "This device starts with bottom navigation because it is easier to reach on small screens."
          : "This device starts with sidebar navigation so larger screens have more room for dashboard tools.",
        targetId: "overview",
        icon: navMode === "bottom" ? PanelBottom : PanelLeft,
      },
      {
        title: "Change bottom or sidebar",
        text: "Open the profile menu at the top-right. In the Navigation section, choose Sidebar or Bottom to save your preferred layout.",
        icon: UserCircle,
      },
      {
        title: "Notifications",
        text: "Use the bell at the top-right to see messages, bookings, orders, and other account updates in one place.",
        targetId: "notifications",
        icon: Bell,
      },
      ...moduleSteps,
    ];
  }, [isMobile, navItems, navMode]);

  const currentStep = steps[stepIndex] ?? steps[0];
  const StepIcon = currentStep?.icon ?? Compass;
  const progress = steps.length > 0 ? ((stepIndex + 1) / steps.length) * 100 : 0;

  useEffect(() => {
    if (hasSavedNavMode) {
      setShowPrompt(false);
      return;
    }

    const dismissed = sessionStorage.getItem(NAV_PROMPT_DISMISSED_KEY) === "true";
    setShowPrompt(!dismissed);
  }, [hasSavedNavMode, navMode, isMobile]);

  useEffect(() => {
    if (!showPrompt) return;

    const timer = window.setTimeout(() => {
      sessionStorage.setItem(NAV_PROMPT_DISMISSED_KEY, "true");
      setShowPrompt(false);
    }, NAV_PROMPT_AUTO_HIDE_MS);

    return () => window.clearTimeout(timer);
  }, [showPrompt]);

  useEffect(() => {
    if (!tourOpen || !currentStep) return;

    if (currentStep.title === "Change bottom or sidebar") {
      onShowUserMenu();
      return;
    }

    if (currentStep.targetId) {
      onNavigate(currentStep.targetId);
    }
  }, [currentStep, onNavigate, onShowUserMenu, tourOpen]);

  const dismissPrompt = () => {
    sessionStorage.setItem(NAV_PROMPT_DISMISSED_KEY, "true");
    setShowPrompt(false);
  };

  const startTour = () => {
    dismissPrompt();
    setStepIndex(0);
    setTourOpen(true);
  };

  const closeTour = () => {
    setTourOpen(false);
  };

  const goPrevious = () => {
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const goNext = () => {
    if (stepIndex >= steps.length - 1) {
      closeTour();
      return;
    }

    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  };

  const chooseNavMode = (mode: NavMode) => {
    onSwitchNavMode(mode);
    dismissPrompt();
  };

  return (
    <>
      {showPrompt && (
        <div className="fixed left-4 right-4 top-[72px] z-30 sm:left-auto sm:right-5 sm:w-[420px]" style={{ animation: "slideDown 0.2s ease" }}>
          <div
            className="relative overflow-hidden rounded-xl p-4"
            style={{
              background: "linear-gradient(135deg, var(--bg-secondary, #132333), var(--bg-elevated, #1a2e42))",
              border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
              boxShadow: "0 18px 45px var(--shadow-color, rgba(0,0,0,0.35))",
            }}
          >
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full pointer-events-none" style={{ background: `${color}18` }} />
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, color }}>
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color }}>Quick setup guide</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary, white)" }}>
                  {navMode === "bottom" ? "Bottom navigation is ready" : "Sidebar navigation is ready"}
                </div>
                <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                  We picked the best layout for this screen. Start the guide to walk through the dashboard, or switch layouts now.
                </p>
              </div>
              <button
                onClick={dismissPrompt}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ color: "var(--text-secondary, #8ca5bc)", background: "var(--bg-muted, rgba(255,255,255,0.05))" }}
                aria-label="Dismiss navigation guide"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button onClick={startTour} className="flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold" style={{ background: color, color: "#ffffff" }}>
                <Compass size={14} /> Guide
              </button>
              <button
                onClick={() => chooseNavMode("bottom")}
                className="flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold"
                style={navMode === "bottom" ? { background: color, color: "#ffffff" } : { background: "var(--bg-muted, rgba(255,255,255,0.05))", color: "var(--text-secondary, #8ca5bc)" }}
              >
                <PanelBottom size={14} /> Bottom
              </button>
              <button
                onClick={() => chooseNavMode("sidebar")}
                className="flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold"
                style={navMode === "sidebar" ? { background: color, color: "#ffffff" } : { background: "var(--bg-muted, rgba(255,255,255,0.05))", color: "var(--text-secondary, #8ca5bc)" }}
              >
                <PanelLeft size={14} /> Sidebar
              </button>
            </div>
          </div>
        </div>
      )}

      {!tourOpen && (
        <button
          onClick={startTour}
          className="fixed right-4 top-[72px] z-30 rounded-full px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition-all hover:-translate-y-0.5 sm:right-5"
          style={{
            background: "var(--bg-secondary, #132333)",
            color: "var(--text-primary, white)",
            border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
            boxShadow: "0 12px 32px var(--shadow-color, rgba(0,0,0,0.3))",
          }}
        >
          <Compass size={15} style={{ color }} />
          Start guide
        </button>
      )}

      {tourOpen && currentStep && (
        <div className="fixed left-4 right-4 top-[72px] z-50 sm:left-1/2 sm:right-auto sm:w-[500px] sm:-translate-x-1/2" style={{ animation: "slideDown 0.2s ease" }}>
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: "var(--bg-secondary, #132333)",
              border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
              boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
            }}
          >
            <div className="h-1.5" style={{ background: "var(--bg-muted, rgba(255,255,255,0.08))" }}>
              <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: color }} />
            </div>

            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, color }}>
                  <StepIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color }}>
                    Step {stepIndex + 1} of {steps.length}
                  </div>
                  <h2 className="text-base font-black" style={{ color: "var(--text-primary, white)" }}>{currentStep.title}</h2>
                  <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{currentStep.text}</p>
                </div>
                <button
                  onClick={closeTour}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--bg-muted, rgba(255,255,255,0.05))", color: "var(--text-secondary, #8ca5bc)" }}
                  aria-label="Close dashboard guide"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="mt-4 rounded-xl p-3" style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                  <Compass size={14} style={{ color }} />
                  The page behind this card changes as you move through the guide.
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={closeTour}
                  className="rounded-lg px-3 py-2 text-xs font-semibold"
                  style={{ color: "var(--text-secondary, #8ca5bc)", background: "transparent" }}
                >
                  Skip
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={goPrevious}
                    disabled={stepIndex === 0}
                    className="rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
                    style={{ background: "var(--bg-muted, rgba(255,255,255,0.05))", color: "var(--text-primary, white)" }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    onClick={goNext}
                    className="rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1"
                    style={{ background: color, color: "#ffffff" }}
                  >
                    {stepIndex === steps.length - 1 ? "Finish" : "Next"}
                    {stepIndex < steps.length - 1 && <ChevronRight size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



