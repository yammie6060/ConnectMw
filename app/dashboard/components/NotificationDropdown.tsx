import { Bell, MessageSquare, CalendarCheck, Package, Star, ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Notification {
  id: number;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  icon: any;
}

const RECENT_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "New message received",
    detail: "Mphatso Banda asked if your item is still available.",
    time: "8 min ago",
    unread: true,
    icon: MessageSquare,
  },
  {
    id: 2,
    title: "Booking reminder",
    detail: "Grace Nails Studio appointment is scheduled for tomorrow.",
    time: "1h ago",
    unread: true,
    icon: CalendarCheck,
  },
  {
    id: 3,
    title: "Order update",
    detail: "Toyota Vitz Side Mirror quote was received successfully.",
    time: "Yesterday",
    unread: false,
    icon: Package,
  },
];

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAll: () => void;
  color: string;
}

export function NotificationDropdown({
  isOpen,
  onClose,
  onNavigateToAll,
  color,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = RECENT_NOTIFICATIONS.filter((item) => item.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-[60px] right-4 md:right-6 z-50 w-[360px] rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        background: "var(--bg-secondary, #132333)",
        border: "1px solid var(--border-color, rgba(255,255,255,0.07))",
        boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.07))",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}18`, color }}
          >
            <Bell size={16} />
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--text-primary, white)" }}>
            Notifications
          </span>
        </div>
        {unreadCount > 0 && (
          <span
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{
              background: `${color}24`,
              color: color,
            }}
          >
            {unreadCount} new
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {RECENT_NOTIFICATIONS.length > 0 ? (
          RECENT_NOTIFICATIONS.map((notification) => {
            const Icon = notification.icon;
            return (
              <button
                key={notification.id}
                className="w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5 active:bg-white/10"
                style={{
                  borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.07))",
                }}
              >
                <div
                  className="relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${color}14`,
                    color: color,
                  }}
                >
                  <Icon size={14} />
                  {notification.unread && (
                    <span
                      className="absolute -right-1 -top-1 w-2 h-2 rounded-full"
                      style={{ background: color }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold" style={{ color: "var(--text-primary, white)" }}>
                    {notification.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed mt-0.5 line-clamp-2"
                    style={{ color: "var(--text-secondary, #8ca5bc)" }}
                  >
                    {notification.detail}
                  </p>
                  <span
                    className="text-[10px] inline-block mt-1"
                    style={{ color: "var(--text-secondary, #8ca5bc)" }}
                  >
                    {notification.time}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="px-4 py-8 text-center">
            <p
              className="text-xs"
              style={{ color: "var(--text-secondary, #8ca5bc)" }}
            >
              No notifications yet
            </p>
          </div>
        )}
      </div>

      {/* Footer - View All Button */}
      <button
        onClick={() => {
          onNavigateToAll();
          onClose();
        }}
        className="w-full px-4 py-3 flex items-center justify-between transition-colors hover:bg-white/5 active:bg-white/10"
        style={{
          borderTop: "1px solid var(--border-color, rgba(255,255,255,0.07))",
          color: color,
        }}
      >
        <span className="text-xs font-bold uppercase tracking-wider">View All</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
