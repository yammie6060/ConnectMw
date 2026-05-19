"use client";

import { ChevronLeft, LogOut, X } from 'lucide-react';
import { NavItem, RoleMeta, SessionUser } from '../types/dashboard';
import { DashboardAvatar } from './DashboardAvatar';

interface SidebarProps {
  navMode: string;
  isMobile: boolean;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  user: SessionUser;
  navItems: NavItem[];
  activeItem: string;
  color: string;
  meta: RoleMeta;
  onNavigate: (id: string) => void;
  onToggleSidebar: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export function Sidebar({
  navMode,
  isMobile,
  sidebarCollapsed,
  mobileSidebarOpen,
  user,
  navItems,
  activeItem,
  color,
  meta,
  onNavigate,
  onToggleSidebar,
  onCloseMobile,
  onLogout
}: SidebarProps) {
  const RoleIcon = meta.icon;
  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  // Desktop Sidebar
  if (navMode === "sidebar" && !isMobile) {
    return (
      <>
        <style>{`
          .sidebar-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.15s;
            text-decoration: none;
            color: var(--text-secondary, #8ca5bc);
            font-size: 0.88rem;
            font-weight: 500;
            white-space: nowrap;
            width: 100%;
            border: none;
            background: transparent;
          }
          .sidebar-link:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-primary, white);
          }
          .sidebar-link.active {
            background: rgba(245, 171, 32, 0.10);
            color: #f5ab20;
          }
        `}</style>
        <aside className="fixed left-0 top-0 bottom-0 z-30 flex flex-col transition-all duration-300 ease-in-out"
          style={{ width: `${sidebarWidth}px`, background: "var(--bg-secondary, #132333)", borderRight: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
          <div className="h-[60px] flex items-center justify-between px-3 border-b border-white/5">
            {!sidebarCollapsed && (
              <a href="/" className="font-black text-[1.15rem] no-underline tracking-tight" style={{ color: "var(--text-primary, white)" }}>
                Connect<span style={{ color: "#f5ab20" }}>MW</span>
              </a>
            )}
            <button onClick={onToggleSidebar} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer border-0 flex-shrink-0 ml-auto"
              style={{ background: "rgba(255,255,255,0.05)", color: "#8ca5bc" }}>
              <ChevronLeft size={16} style={{ transform: sidebarCollapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
            </button>
          </div>

          <div className={`p-3 border-b border-white/5 ${sidebarCollapsed ? "text-center" : ""}`}>
            <div className={`flex ${sidebarCollapsed ? "flex-col" : "items-center gap-3"}`}>
              <DashboardAvatar user={user} size="sm" className="mx-auto" />
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary, white)" }}>{user.firstName} {user.lastName}</div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${color}20`, color }}>
                    <RoleIcon size={9} /> {meta.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <button key={item.id} onClick={() => onNavigate(item.id)}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  title={sidebarCollapsed ? item.label : undefined}>
                  <div className="relative flex-shrink-0">
                    <Icon size={18} />
                    {item.badge && sidebarCollapsed && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black"
                        style={{ background: "#f5ab20", color: "#0d1f2d" }}>{item.badge > 9 ? "9+" : item.badge}</span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: `${color}20`, color }}>{item.badge}</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/5">
            <button onClick={onLogout} className="sidebar-link w-full" style={{ color: "#ef4444" }}
              title={sidebarCollapsed ? "Sign Out" : undefined}>
              <LogOut size={18} />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>
      </>
    );
  }

  // Mobile Sidebar Drawer
  if (navMode === "sidebar" && isMobile && mobileSidebarOpen) {
    return (
      <>
        <style>{`
          .sidebar-link-mobile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.15s;
            text-decoration: none;
            color: var(--text-secondary, #8ca5bc);
            font-size: 0.88rem;
            font-weight: 500;
            white-space: nowrap;
            width: 100%;
            border: none;
            background: transparent;
          }
          .sidebar-link-mobile:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-primary, white);
          }
          .sidebar-link-mobile.active {
            background: rgba(245, 171, 32, 0.10);
            color: #f5ab20;
          }
        `}</style>
        <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.5)", animation: "fadeIn 0.2s ease" }}
          onClick={onCloseMobile} />
        <aside className="fixed left-0 top-0 bottom-0 z-50 flex flex-col"
          style={{ width: "260px", background: "var(--bg-secondary, #132333)", borderRight: "1px solid var(--border-color, rgba(255,255,255,0.07))", animation: "slideRight 0.25s ease" }}>
          <div className="h-[60px] flex items-center justify-between px-4 border-b border-white/5">
            <a href="/" className="font-black text-[1.15rem] no-underline tracking-tight" style={{ color: "var(--text-primary, white)" }}>
              Connect<span style={{ color: "#f5ab20" }}>MW</span>
            </a>
            <button onClick={onCloseMobile} style={{ color: "#8ca5bc" }}><X size={18} /></button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => onNavigate(item.id)}
                  className={`sidebar-link-mobile ${activeItem === item.id ? "active" : ""}`}>
                  <Icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>{item.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-white/5">
            <button onClick={onLogout} className="sidebar-link-mobile w-full" style={{ color: "#ef4444" }}>
              <LogOut size={18} /><span>Sign Out</span>
            </button>
          </div>
        </aside>
      </>
    );
  }

  return null;
}
