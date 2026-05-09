import { Bell, Menu, PanelBottom, PanelLeft, Sun, Moon } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { NavItem, RoleMeta, SessionUser, NavMode } from '../types/dashboard';
import { UserMenu } from './UserMenu';
import { NotificationDropdown } from './NotificationDropdown';

interface TopBarProps {
  navMode: NavMode;
  isMobile: boolean;
  sidebarWidth: number;
  user: SessionUser;
  meta: RoleMeta;
  isDarkMode: boolean;
  navItems: NavItem[];
  activeItem: string;
  onToggleTheme: () => void;
  onSwitchNavMode: (mode: NavMode) => void;
  onOpenMobileSidebar: () => void;
  onNavigate: (id: string) => void;
  onLogout: () => void;
  userMenuRef: React.RefObject<HTMLDivElement>;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  color: string;
}

export function TopBar({
  navMode,
  isMobile,
  sidebarWidth,
  user,
  meta,
  isDarkMode,
  navItems,
  activeItem,
  onToggleTheme,
  onSwitchNavMode,
  onOpenMobileSidebar,
  onNavigate,
  onLogout,
  userMenuRef,
  showUserMenu,
  setShowUserMenu,
  color,
}: TopBarProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current && 
        !notificationRef.current.contains(event.target as Node) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  return (
    <>
      <nav 
        className="fixed right-0 z-20 flex items-center justify-between h-[60px] px-4 md:px-6"
        style={{
          left: navMode === "sidebar" && !isMobile ? `${sidebarWidth}px` : 0,
          background: "var(--nav-bg, rgba(13,31,45,0.97))",
          borderBottom: "1px solid var(--border-color, rgba(245,166,35,0.12))",
          backdropFilter: "blur(16px)",
          transition: "left 0.3s ease",
        }}
      >
        <div className="flex items-center gap-3">
          {navMode === "sidebar" && isMobile && (
            <button 
              onClick={onOpenMobileSidebar}
              className="w-9 h-9 flex items-center justify-center rounded-lg border-0"
              style={{ background: "var(--bg-muted, rgba(255,255,255,0.05))", color: "var(--text-secondary, #8ca5bc)" }}
            >
              <Menu size={18} />
            </button>
          )}
          {navMode === "bottom" && (
            <a href="/" className="font-black text-[1.15rem] no-underline tracking-tight" style={{ color: "var(--text-primary, white)" }}>
              Connect<span style={{ color: "#f5ab20" }}>MW</span>
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Button with ref */}
          <div className="relative">
            <button
              ref={notificationButtonRef}
              onClick={handleNotificationClick}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
              style={{ 
                background: "var(--bg-muted, rgba(255,255,255,0.05))", 
                border: "1px solid var(--border-color, rgba(255,255,255,0.1))", 
                color: "var(--text-secondary, #8ca5bc)"
              }}
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#f5ab20]" />
            </button>
          </div>

          <UserMenu
            user={user}
            meta={meta}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            navMode={navMode}
            activeItem={activeItem}
            userMenuRef={userMenuRef}
            showUserMenu={showUserMenu}
            setShowUserMenu={setShowUserMenu}
            onNavigate={onNavigate}
            onToggleTheme={onToggleTheme}
            onSwitchNavMode={onSwitchNavMode}
            onLogout={onLogout}
          />
        </div>
      </nav>

      {/* Notification Dropdown - Rendered outside the nav bar */}
      <NotificationDropdown
        isOpen={showNotificationDropdown}
        onClose={() => setShowNotificationDropdown(false)}
        onNavigateToAll={() => {
          setShowNotificationDropdown(false);
          onNavigate("notifications");
        }}
        color={color}
      />
    </>
  );
}