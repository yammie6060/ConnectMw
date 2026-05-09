"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "./hooks/useTheme";
import { ROLE_META } from "./config/roles";
import { ROLE_NAV } from "./config/nav";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { renderPage } from "./utils/renderPage";
import { BottomNav } from "./components/BottomNav";
import { DashboardTour } from "./components/DashboardTour";
import { LogoutConfirmModal } from "./components/LogoutConfirmModal";
import { useNavMode } from "./hooks/useNavMode";
import { SessionUser } from "./types/dashboard";
import { clearSession, getSession } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeItem, setActiveItem] = useState("overview");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { navMode, sidebarCollapsed, isMobile, hasSavedNavMode, switchNavMode, toggleSidebar } = useNavMode();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/");
      return;
    }
    setUser(session);
    setLoaded(true);
  }, [router]);

  const requestLogout = () => {
    setShowUserMenu(false);
    setMobileSidebarOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    clearSession();
    router.push("/");
  };

  const navigate = useCallback((id: string) => {
    setActiveItem(id);
    setShowUserMenu(false);
    setMobileSidebarOpen(false);
  }, []);

  const showProfileMenu = useCallback(() => {
    setShowUserMenu(true);
    setMobileSidebarOpen(false);
  }, []);

  if (!loaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d1f2d" }}>
        <div className="flex flex-col items-center gap-3">
          <svg className="w-16 h-16" viewBox="0 0 64 64" role="img" aria-label="Loading ConnectMW dashboard">
            <defs>
              <linearGradient id="connect-loader-gradient" x1="12" x2="52" y1="10" y2="54">
                <stop stopColor="#1b4f6a" />
                <stop offset="1" stopColor="#f5ab20" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <path
              d="M45.5 20.5A18 18 0 1 0 45.5 43.5"
              fill="none"
              stroke="url(#connect-loader-gradient)"
              strokeLinecap="round"
              strokeWidth="7"
              style={{ transformBox: "fill-box" }}
            />
            <text x="32" y="38" textAnchor="middle" fontSize="22" fontWeight="900" fill="#ffffff" fontFamily="Arial, sans-serif">C</text>
          </svg>
          <p className="text-[#8ca5bc] text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const meta = ROLE_META[user.role] || ROLE_META.customer;
  const navItems = ROLE_NAV[user.role] || ROLE_NAV.customer;
  const color = !isDarkMode && user.role === "customer" ? "#b45309" : meta.color;
  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary, #0d1f2d)", color: "var(--text-primary, white)" }}>
      <style jsx global>{`
        :root {
          --bg-primary: #0d1f2d;
          --bg-secondary: #132333;
          --bg-elevated: #1a2e42;
          --bg-muted: rgba(255,255,255,0.05);
          --nav-bg: rgba(13,31,45,0.97);
          --text-primary: #ffffff;
          --text-secondary: #8ca5bc;
          --text-soft: #cde0f0;
          --border-color: rgba(255,255,255,0.07);
          --shadow-color: rgba(0,0,0,0.4);
        }
        @keyframes slideRight {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-12px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(245,171,32,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(245,171,32,0.5); }
      `}</style>

      {/* Sidebar */}
      <Sidebar
        navMode={navMode}
        isMobile={isMobile}
        sidebarCollapsed={sidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        user={user}
        navItems={navItems}
        activeItem={activeItem}
        color={color}
        meta={meta}
        onNavigate={navigate}
        onToggleSidebar={toggleSidebar}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        onLogout={requestLogout}
      />

      {/* Main Content */}
      <div className="flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: navMode === "sidebar" && !isMobile ? `${sidebarWidth}px` : 0 }}>
        
        {/* Top Bar */}
        <TopBar
          navMode={navMode}
          isMobile={isMobile}
          sidebarWidth={sidebarWidth}
          user={user}
          meta={meta}
          isDarkMode={isDarkMode}
          navItems={navItems}
          activeItem={activeItem}
          onToggleTheme={toggleTheme}
          onSwitchNavMode={switchNavMode}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onNavigate={navigate}
          onLogout={requestLogout}
          userMenuRef={userMenuRef}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          color={color}
        />

        <DashboardTour
          navMode={navMode}
          isMobile={isMobile}
          hasSavedNavMode={hasSavedNavMode}
          color={color}
          navItems={navItems}
          onNavigate={navigate}
          onSwitchNavMode={switchNavMode}
          onShowUserMenu={showProfileMenu}
        />

        {showLogoutConfirm && (
          <LogoutConfirmModal
            onCancel={() => setShowLogoutConfirm(false)}
            onConfirm={confirmLogout}
          />
        )}

        {/* Main Content Area */}
        <main className={`min-h-screen pt-[60px] ${navMode === "bottom" ? "pb-[88px]" : "pb-8"} px-4 sm:px-6 lg:px-8`}
          style={{ maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
          {renderPage(activeItem, user, meta, navItems, navigate, isDarkMode, toggleTheme)}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          navMode={navMode}
          navItems={navItems}
          activeItem={activeItem}
          color={color}
          onNavigate={navigate}
        />
      </div>
    </div>
  );
}
