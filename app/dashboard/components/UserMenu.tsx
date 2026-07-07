import { UserCircle, CreditCard, Shield, HelpCircle, Sun, Moon, PanelLeft, PanelBottom, LogOut, Check, BriefcaseBusiness } from 'lucide-react';
import { NavItem, RoleMeta, SessionUser, NavMode } from '../types/dashboard';
import { DashboardAvatar } from './DashboardAvatar';

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
  onSwitchWorkspace: (role: string, providerId: string | null) => void;
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
  onSwitchWorkspace,
  onLogout
}: UserMenuProps) {
  const RoleIcon = meta.icon;
  const { color } = meta;

  return (
    <div className="relative" ref={userMenuRef}>
      <button 
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-2 w-9 h-9 rounded-full transition-all cursor-pointer bg-gradient-to-br from-[#1b4f6a] to-[#f5ab20]"
      >
        <DashboardAvatar user={user} size="sm" className="w-full h-full" />
      </button>

      {showUserMenu && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[280px] rounded-xl overflow-hidden z-50 bg-[#132333] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.4)] animate-[slideDown_0.15s_ease]">
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <DashboardAvatar user={user} size="md" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate text-white">{user.firstName} {user.lastName}</div>
                <div className="text-[11px] truncate text-[#8ca5bc]">{user.email}</div>
                <span 
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-1"
                  style={{ background: `${color}20`, color }}
                >
                  <RoleIcon size={9} /> {meta.label}
                </span>
              </div>
            </div>
          </div>

          <div className="py-2">
            {user.canSwitchRoles && (
              <div className="px-4 py-2 border-b border-white/10 mb-2">
                <div className="text-[10px] font-semibold uppercase tracking-widest mb-2 text-[#8ca5bc]">Workspace</div>
                <div className="space-y-1">
                  {user.roles.includes("admin") && (
                    <button
                      onClick={() => onSwitchWorkspace("admin", null)}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors hover:bg-white/5 ${
                        user.activeRole === "admin" 
                          ? "text-[var(--accent-color)] bg-[var(--accent-color)]/8" 
                          : "text-[#8ca5bc]"
                      }`}
                      style={{ '--accent-color': color } as React.CSSProperties}
                    >
                      <Shield size={16} />
                      <span className="flex-1 text-left">Admin Console</span>
                      {user.activeRole === "admin" && <Check size={14} />}
                    </button>
                  )}
                  {!user.roles.includes("admin") && user.roles.includes("support") && (
                    <button
                      onClick={() => onSwitchWorkspace("support", null)}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors hover:bg-white/5 ${
                        user.activeRole === "support" 
                          ? "text-[var(--accent-color)] bg-[var(--accent-color)]/8" 
                          : "text-[#8ca5bc]"
                      }`}
                      style={{ '--accent-color': color } as React.CSSProperties}
                    >
                      <HelpCircle size={16} />
                      <span className="flex-1 text-left">Support Desk</span>
                      {user.activeRole === "support" && <Check size={14} />}
                    </button>
                  )}
                  <button
                    onClick={() => onSwitchWorkspace("customer", null)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors hover:bg-white/5 ${
                      user.activeRole === "customer" 
                        ? "text-[var(--accent-color)] bg-[var(--accent-color)]/8" 
                        : "text-[#8ca5bc]"
                    }`}
                    style={{ '--accent-color': color } as React.CSSProperties}
                  >
                    <UserCircle size={16} />
                    <span className="flex-1 text-left">Customer</span>
                    {user.activeRole === "customer" && <Check size={14} />}
                  </button>
                  {user.providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => onSwitchWorkspace(provider.role, provider.id)}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors hover:bg-white/5 ${
                        user.activeProviderId === provider.id 
                          ? "text-[var(--accent-color)] bg-[var(--accent-color)]/8" 
                          : "text-[#8ca5bc]"
                      }`}
                      style={{ '--accent-color': color } as React.CSSProperties}
                    >
                      <BriefcaseBusiness size={16} />
                      <span className="flex-1 min-w-0 text-left">
                        <span className="block truncate">{provider.business_name || provider.display_name || "Provider"}</span>
                        <span className="block text-[10px] opacity-75 truncate">{provider.verification_status}</span>
                      </span>
                      {user.activeProviderId === provider.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button 
              onClick={() => onNavigate("profile")} 
              className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5 text-[#8ca5bc]"
            >
              <UserCircle size={16} /> Profile Settings
            </button>

            <button 
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-white/5 text-[#8ca5bc]"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              </div>
              <div className="w-8 h-4 rounded-full p-0.5 transition-colors bg-[#f5ab20]/20">
                <div className="w-3 h-3 rounded-full bg-[#f5ab20] transition-transform" style={{ transform: isDarkMode ? "translateX(0)" : "translateX(16px)" }} />
              </div>
            </button>

            {/* Navigation Mode Switcher - Show on ALL devices */}
            <div className="px-4 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest mb-2 text-[#8ca5bc]">Navigation</div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onSwitchNavMode("sidebar")}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    navMode === "sidebar" 
                      ? "bg-[#f5ab20] text-[#0d1f2d]" 
                      : "bg-white/5 text-[#8ca5bc]"
                  }`}
                >
                  <PanelLeft size={12} /> Sidebar
                </button>
                <button 
                  onClick={() => onSwitchNavMode("bottom")}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    navMode === "bottom" 
                      ? "bg-[#f5ab20] text-[#0d1f2d]" 
                      : "bg-white/5 text-[#8ca5bc]"
                  }`}
                >
                  <PanelBottom size={12} /> Bottom
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-2">
            <button 
              onClick={onLogout} 
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}