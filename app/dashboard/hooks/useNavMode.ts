import { useState, useEffect } from 'react';
import { NavMode } from '../types/dashboard';

const NAV_MODE_STORAGE_KEY = "connectmw_nav_mode";
const SIDEBAR_COLLAPSED_STORAGE_KEY = "connectmw_sidebar_collapsed";
const MOBILE_BREAKPOINT_QUERY = "(max-width: 1023px)";

function readSavedNavMode(): NavMode | null {
  const saved = localStorage.getItem(NAV_MODE_STORAGE_KEY);
  return saved === "bottom" || saved === "sidebar" ? saved : null;
}

function getDefaultNavMode(isMobile: boolean): NavMode {
  return isMobile ? "bottom" : "sidebar";
}

export function useNavMode() {
  const [navMode, setNavMode] = useState<NavMode>("sidebar");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasSavedNavMode, setHasSavedNavMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);

    const applyNavMode = () => {
      const saved = readSavedNavMode();
      const matchesMobile = mediaQuery.matches;
      setIsMobile(matchesMobile);
      setHasSavedNavMode(Boolean(saved));
      setNavMode(saved ?? getDefaultNavMode(matchesMobile));
    };

    applyNavMode();
    mediaQuery.addEventListener("change", applyNavMode);
    return () => mediaQuery.removeEventListener("change", applyNavMode);
  }, []);

  useEffect(() => {
    if (!isMobile && navMode === "sidebar") {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
      setSidebarCollapsed(saved === "true");
    }
  }, [isMobile, navMode]);

  const switchNavMode = (mode: NavMode) => {
    localStorage.setItem(NAV_MODE_STORAGE_KEY, mode);
    setHasSavedNavMode(true);
    setNavMode(mode);
  };

  const toggleSidebar = () => {
    if (!isMobile) {
      const newState = !sidebarCollapsed;
      setSidebarCollapsed(newState);
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(newState));
    }
  };

  return { navMode, sidebarCollapsed, isMobile, hasSavedNavMode, switchNavMode, toggleSidebar };
}
