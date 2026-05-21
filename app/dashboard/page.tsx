"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { withLoading } from "@/components/withLoading";
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
import { clearSession, getSession, setActiveWorkspace } from "@/lib/auth";
import { authService } from "@/services/auth.service";

const ACTIVE_PAGE_KEY = "connectmw_dashboard_active_item";

function defaultPageForRole(role: string) {
  return ["admin", "support"].includes(role) ? "admin" : "overview";
}

function pageKeyForRole(role: string) {
  return `${ACTIVE_PAGE_KEY}:${role}`;
}

function getSavedActivePage(role: string) {
  if (typeof window === "undefined") return defaultPageForRole(role);
  return window.localStorage.getItem(pageKeyForRole(role)) || defaultPageForRole(role);
}

function setSavedActivePage(role: string, item: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(pageKeyForRole(role), item);
}

function clearSavedActivePages() {
  if (typeof window === "undefined") return;
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(`${ACTIVE_PAGE_KEY}:`))
    .forEach((key) => window.localStorage.removeItem(key));
}

function DashboardContent() {
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
    const checkSession = async () => {
      await authService.refreshSession().catch(() => null);
      const session = getSession();
      if (!session) { 
        router.replace("/signin"); 
        return; 
      }
      if (session.mustChangePassword) { 
        router.replace("/set-password"); 
        return; 
      }
      setUser(session);
      setActiveItem(getSavedActivePage(session.role));
      setLoaded(true);
    };
    checkSession();
  }, [router]);

  if (!loaded || !user) return null; // Will be handled by withLoading HOC

  const meta = ROLE_META[user.role] || ROLE_META.customer;
  const navItems = ROLE_NAV[user.role] || ROLE_NAV.customer;
  const color = !isDarkMode && user.role === "customer" ? "#b45309" : meta.color;
  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  const requestLogout = () => {
    setShowUserMenu(false);
    setMobileSidebarOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    clearSavedActivePages();
    clearSession();
    router.push("/signin");
  };

  const navigate = (id: string) => {
    setSavedActivePage(user.role, id);
    setActiveItem(id);
    setShowUserMenu(false);
    setMobileSidebarOpen(false);
  };

  const switchWorkspace = (role: string, providerId: string | null) => {
    setActiveWorkspace(role, providerId);
    const session = getSession();
    if (session) {
      setUser(session);
      const defaultPage = defaultPageForRole(session.role);
      setSavedActivePage(session.role, defaultPage);
      setActiveItem(defaultPage);
    }
    setShowUserMenu(false);
    setMobileSidebarOpen(false);
  };

  const refreshSession = () => {
    const session = getSession();
    if (session) setUser(session);
  };

  const showProfileMenu = () => {
    setShowUserMenu(true);
    setMobileSidebarOpen(false);
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--bg-primary, #0d1f2d)", color: "var(--text-primary, white)" }}
    >
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
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(245,171,32,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(245,171,32,0.5); }
      `}</style>

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

      <div
        className="flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: navMode === "sidebar" && !isMobile ? `${sidebarWidth}px` : 0 }}
      >
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
          onSwitchWorkspace={switchWorkspace}
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

        <main
          className={`min-h-screen pt-[60px] ${navMode === "bottom" ? "pb-[88px]" : "pb-8"} px-4 sm:px-6 lg:px-8`}
          style={{ maxWidth: "1240px", margin: "0 auto", width: "100%" }}
        >
          {renderPage(activeItem, user, meta, navItems, navigate, isDarkMode, toggleTheme, refreshSession)}
        </main>

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

// Export with loading HOC - 5 seconds minimum display time
export default withLoading(DashboardContent, 5000);