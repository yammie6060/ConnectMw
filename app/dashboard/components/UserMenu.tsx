import { UserCircle, CreditCard, Shield, HelpCircle, Sun, Moon, PanelLeft, PanelBottom, LogOut } from 'lucide-react';
import { NavItem, RoleMeta, SessionUser, NavMode } from '../types/dashboard';

interface UserMenuProps {
  user: SessionUser;
  meta: RoleMeta;
  isDarkMode: boolean;
  isMobile: boolean;
  navMode: NavMode;
  activeItem: string;
  userMenuRef: React.RefObject<HTMLDivElement>;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  onNavigate: (id: string) => void;
  onToggleTheme: () => void;
  onSwitchNavMode: (mode: NavMode) => void;
  onLogout: () => void;
}

export function UserMenu({
  user,
  meta,
  isDarkMode,
  isMobile,
  navMode,
  activeItem,
  userMenuRef,
  showUserMenu,
  setShowUserMenu,
  onNavigate,
  onToggleTheme,
  onSwitchNavMode,
  onLogout
}: UserMenuProps) {
  const RoleIcon = meta.icon;
  const { color } = meta;

  return (
    <div className="relative" ref={userMenuRef}>
      <button onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-2 w-9 h-9 rounded-full transition-all cursor-pointer"
        style={{ background: "linear-gradient(135deg, #1b4f6a, #f5ab20)" }}>
        <div className="w-full h-full rounded-full flex items-center justify-center font-black text-sm text-[#0d1f2d]">
          {user.firstName[0]}{user.lastName[0]}
        </div>
      </button>

      {showUserMenu && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[280px] rounded-xl overflow-hidden z-50"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid var(--border-color, rgba(255,255,255,0.1))", boxShadow: "0 16px 40px var(--shadow-color, rgba(0,0,0,0.4))", animation: "slideDown 0.15s ease" }}>
          
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                style={{ background: "linear-gradient(135deg, #1b4f6a, #f5ab20)", color: "#0d1f2d" }}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary, white)" }}>{user.firstName} {user.lastName}</div>
                <div className="text-[11px] truncate" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{user.email}</div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-1"
                  style={{ background: `${color}20`, color }}>
                  <RoleIcon size={9} /> {meta.label}
                </span>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button onClick={() => onNavigate("profile")} className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
              <UserCircle size={16} /> Profile Settings
            </button>
            <button onClick={() => onNavigate("billing")} className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
              <CreditCard size={16} /> Billing & Plans
            </button>
            <button onClick={() => onNavigate("privacy")} className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
              <Shield size={16} /> Privacy & Security
            </button>
            <button onClick={() => onNavigate("help")} className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
              <HelpCircle size={16} /> Help & Support
            </button>

            <button onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-white/5"
              style={{ color: "var(--text-secondary, #8ca5bc)" }}>
              <div className="flex items-center gap-3">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              </div>
              <div className="w-8 h-4 rounded-full p-0.5 transition-colors" style={{ background: "rgba(245,171,32,0.2)" }}>
                <div className="w-3 h-3 rounded-full bg-[#f5ab20] transition-transform" style={{ transform: isDarkMode ? "translateX(0)" : "translateX(16px)" }} />
              </div>
            </button>

            {/* Navigation Mode Switcher - Show on ALL devices (both mobile and desktop) */}
            <div className="px-4 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Navigation</div>
              <div className="flex gap-2">
                <button onClick={() => onSwitchNavMode("sidebar")}
                  className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={navMode === "sidebar" ? { background: "#f5ab20", color: "#0d1f2d" } : { background: "var(--bg-muted, rgba(255,255,255,0.05))", color: "var(--text-secondary, #8ca5bc)" }}>
                  <PanelLeft size={12} /> Sidebar
                </button>
                <button onClick={() => onSwitchNavMode("bottom")}
                  className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={navMode === "bottom" ? { background: "#f5ab20", color: "#0d1f2d" } : { background: "var(--bg-muted, rgba(255,255,255,0.05))", color: "var(--text-secondary, #8ca5bc)" }}>
                  <PanelBottom size={12} /> Bottom
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-2">
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-[#ef4444] hover:bg-red-500/10 transition-colors">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
