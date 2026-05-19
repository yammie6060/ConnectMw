import { useEffect, useRef, useState } from "react";
import { Bell, Package, Home, Sparkles, MessageSquare, X } from "lucide-react";
import { NotificationItem, notificationService } from "@/services/notification.service";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAll: () => void;
  color: string;
  anchorRef?: React.RefObject<HTMLButtonElement>;
}

function iconFor(type?: string | null) {
  if (type === "new_listing") return Package;
  if (type === "provider_activity") return Home;
  if (type === "booking") return Sparkles;
  return MessageSquare;
}

function timeAgo(value?: string | null) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationDropdown({ isOpen, onClose, onNavigateToAll, color }: NotificationDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const unreadCount = items.filter((item) => !item.is_read).length;

  useEffect(() => {
    if (!isOpen) return;
    notificationService.list(5).then((res) => setItems(res.data?.items ?? [])).catch(() => setItems([]));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, [isOpen, onClose]);

  const markRead = (item: NotificationItem) => {
    if (item.is_read) return;
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_read: true } : entry));
    notificationService.markRead(item.id).catch(() => undefined);
  };

  if (!isOpen) return null;

  return (
    <div ref={ref} style={{ position: "fixed", top: "68px", right: "16px", width: "320px", zIndex: 9999, background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", animation: "slideDown 0.18s ease" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <Bell size={14} style={{ color }} />
          <span className="text-sm font-bold" style={{ color: "var(--text-primary, white)" }}>Notifications</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>{unreadCount}</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors" style={{ color: "#8ca5bc" }}><X size={13} /></button>
      </div>
      <div>
        {items.length > 0 ? items.map((item) => {
          const Icon = iconFor(item.notification_type);
          return (
            <button key={item.id} onClick={() => markRead(item)} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: !item.is_read ? `${color}06` : "transparent" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}18`, color }}><Icon size={14} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: !item.is_read ? "var(--text-primary, white)" : "var(--text-secondary, #8ca5bc)" }}>{item.title}</p>
                <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: "#8ca5bc" }}>{item.message}</p>
                <span className="text-[10px]" style={{ color: "#8ca5bc" }}>{timeAgo(item.created_at)}</span>
              </div>
              {!item.is_read && <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />}
            </button>
          );
        }) : (
          <div className="px-4 py-8 text-center text-xs" style={{ color: "#8ca5bc" }}>No notifications yet</div>
        )}
      </div>
      <button onClick={onNavigateToAll} className="w-full py-3 text-xs font-semibold transition-colors hover:bg-white/[0.03]" style={{ color, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        View all notifications
      </button>
    </div>
  );
}
