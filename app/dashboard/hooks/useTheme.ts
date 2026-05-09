import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const applyTheme = (dark: boolean) => {
    if (!dark) {
      document.documentElement.style.setProperty("--bg-primary", "#f3f4f6");
      document.documentElement.style.setProperty("--bg-secondary", "#ffffff");
      document.documentElement.style.setProperty("--bg-elevated", "#f8fafc");
      document.documentElement.style.setProperty("--bg-muted", "#eef2f7");
      document.documentElement.style.setProperty("--nav-bg", "rgba(255,255,255,0.94)");
      document.documentElement.style.setProperty("--text-primary", "#111827");
      document.documentElement.style.setProperty("--text-secondary", "#6b7280");
      document.documentElement.style.setProperty("--text-soft", "#334155");
      document.documentElement.style.setProperty("--accent-primary", "#b45309");
      document.documentElement.style.setProperty("--border-color", "rgba(0,0,0,0.07)");
      document.documentElement.style.setProperty("--shadow-color", "rgba(15,23,42,0.12)");
      document.body.style.background = "#f3f4f6";
      document.body.style.color = "#111827";
    } else {
      document.documentElement.style.setProperty("--bg-primary", "#0d1f2d");
      document.documentElement.style.setProperty("--bg-secondary", "#132333");
      document.documentElement.style.setProperty("--bg-elevated", "#1a2e42");
      document.documentElement.style.setProperty("--bg-muted", "rgba(255,255,255,0.05)");
      document.documentElement.style.setProperty("--nav-bg", "rgba(13,31,45,0.97)");
      document.documentElement.style.setProperty("--text-primary", "#ffffff");
      document.documentElement.style.setProperty("--text-secondary", "#8ca5bc");
      document.documentElement.style.setProperty("--text-soft", "#cde0f0");
      document.documentElement.style.setProperty("--accent-primary", "#f5ab20");
      document.documentElement.style.setProperty("--border-color", "rgba(255,255,255,0.07)");
      document.documentElement.style.setProperty("--shadow-color", "rgba(0,0,0,0.4)");
      document.body.style.background = "#0d1f2d";
      document.body.style.color = "#ffffff";
    }
  };

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem("connectmw_theme", next ? "dark" : "light");
    applyTheme(next);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("connectmw_theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      applyTheme(false);
    } else {
      applyTheme(true);
    }
  }, []);

  return { isDarkMode, toggleTheme };
}
