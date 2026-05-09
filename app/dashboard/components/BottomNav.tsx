"use client";

import { Menu, X } from 'lucide-react';
import { NavItem, NavMode } from '../types/dashboard';
import { useState, useRef, useEffect } from 'react';

interface BottomNavProps {
  navMode: NavMode;
  navItems: NavItem[];
  activeItem: string;
  color: string;
  onNavigate: (id: string) => void;
}

export function BottomNav({ navMode, navItems, activeItem, color, onNavigate }: BottomNavProps) {
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const mobileMoreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (mobileMoreMenuRef.current && !mobileMoreMenuRef.current.contains(e.target as Node)) {
        setShowMobileMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (navMode !== "bottom") return null;

  const bottomItems = navItems.slice(0, 4);
  const moreItems = navItems.slice(4);
  const totalBadge = moreItems.reduce((s, i) => s + (i.badge || 0), 0);

  return (
    <>
      <style>{`
        .bottom-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 8px 0;
          flex: 1;
          cursor: pointer;
          border: none;
          background: none;
          color: var(--text-secondary, #8ca5bc);
          font-size: 10px;
          font-weight: 500;
          transition: color 0.15s;
          position: relative;
          min-width: 0;
        }
        .bottom-tab.active {
          color: #f5ab20;
        }
        .bottom-tab:hover {
          color: var(--text-primary, #cde0f0);
        }
        .bottom-tab span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
      `}</style>
      <nav className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "var(--nav-bg, rgba(13,31,45,0.98))",
          borderTop: "1px solid var(--border-color, rgba(245,166,35,0.1))",
          backdropFilter: "blur(20px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
        <div className="flex items-stretch" style={{ height: "62px" }}>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                className={`bottom-tab ${isActive ? "active" : ""}`}>
                {isActive && <span className="absolute top-1.5 w-1 h-1 rounded-full bg-[#f5ab20]" />}
                <div className="relative">
                  <Icon size={isActive ? 21 : 19} strokeWidth={isActive ? 2.5 : 1.8} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] font-black px-0.5 bg-[#f5ab20] text-[#0d1f2d]">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "9.5px", lineHeight: 1 }}>{item.label}</span>
              </button>
            );
          })}

          {moreItems.length > 0 && (
            <div className="relative flex-1" ref={mobileMoreMenuRef}>
              <button onClick={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
                className={`bottom-tab ${showMobileMoreMenu ? "active" : ""}`}
                style={{ flex: "none", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
                <div className="relative">
                  <Menu size={19} strokeWidth={1.8} />
                  {totalBadge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] font-black px-0.5 bg-[#f5ab20] text-[#0d1f2d]">
                      {totalBadge > 9 ? "9+" : totalBadge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "9.5px", lineHeight: 1 }}>More</span>
              </button>

              {showMobileMoreMenu && (
                <>
                  <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setShowMobileMoreMenu(false)} />
                  <div className="absolute bottom-full right-0 mb-2 w-[220px] rounded-2xl p-4 z-50"
                    style={{ background: "var(--bg-secondary, #132333)", border: "1px solid var(--border-color, rgba(255,255,255,0.08))", animation: "slideUp 0.2s ease", boxShadow: "0 16px 40px var(--shadow-color, rgba(0,0,0,0.5))" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary, #8ca5bc)" }}>More Options</span>
                      <button onClick={() => setShowMobileMoreMenu(false)} style={{ color: "var(--text-secondary, #8ca5bc)" }}><X size={16} /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {moreItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;
                        return (
                          <button key={item.id}
                            onClick={() => {
                              onNavigate(item.id);
                              setShowMobileMoreMenu(false);
                            }}
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all relative"
                            style={{ background: isActive ? `${color}18` : "var(--bg-elevated, #1a2e42)", border: `1px solid ${isActive ? color + "40" : "var(--border-color, rgba(255,255,255,0.06))"}`, color: isActive ? color : "var(--text-secondary, #8ca5bc)" }}>
                            {item.badge && (
                              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black bg-[#f5ab20] text-[#0d1f2d]">
                                {item.badge}
                              </span>
                            )}
                            <Icon size={16} />
                            <span className="text-[9px] font-medium text-center leading-tight">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
