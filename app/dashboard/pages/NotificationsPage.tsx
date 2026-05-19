import { useEffect, useState } from "react";
import { Bell, CalendarCheck, CheckCircle2, MessageSquare, Package, Star } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { NotificationItem, notificationService } from "@/services/notification.service";

interface NotificationsPageProps {
  color: string;
}

function iconFor(type?: string | null) {
  if (type === "new_listing") return Package;
  if (type === "provider_activity") return CheckCircle2;
  if (type === "booking") return CalendarCheck;
  if (type === "review") return Star;
  return MessageSquare;
}

function timeAgo(value?: string | null) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsPage({ color }: NotificationsPageProps) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    notificationService.list(75)
      .then((res) => {
        setItems(res.data?.items ?? []);
        setUnreadCount(res.data?.unread_count ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = (item: NotificationItem) => {
    if (item.is_read) return;
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_read: true } : entry));
    setUnreadCount((count) => Math.max(0, count - 1));
    notificationService.markRead(item.id).catch(load);
  };

  const markAllRead = () => {
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
    notificationService.markAllRead().catch(load);
  };

  return (
    <PageShell title="Notifications" subtitle="Updates from listings, services, and your activity" color={color}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
        <div className="rounded-xl p-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))", color }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}18` }}><Bell size={20} /></div>
          <div className="text-3xl font-black leading-none">{unreadCount}</div>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary, #8ca5bc)" }}>unread notification{unreadCount === 1 ? "" : "s"} waiting for you.</p>
          <button onClick={markAllRead} className="mt-4 px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-50" disabled={unreadCount === 0} style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
            Mark all read
          </button>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
            <h2 className="text-xs font-bold uppercase" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Recent Notifications</h2>
            <CheckCircle2 size={15} style={{ color }} />
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {loading && <div className="p-5 text-sm" style={{ color: "#8ca5bc" }}>Loading notifications...</div>}
            {!loading && items.length > 0 && items.map((item) => {
              const Icon = iconFor(item.notification_type);
              return (
                <button key={item.id} onClick={() => markRead(item)} className="w-full text-left flex items-start gap-3 p-4 transition-colors hover:bg-white/[0.04]" style={{ borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.07))", background: !item.is_read ? `${color}07` : "transparent" }}>
                  <div className="relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ color, background: `${color}12` }}>
                    <Icon size={16} />
                    {!item.is_read && <span className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full" style={{ background: color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-bold" style={{ color: "var(--text-primary, white)" }}>{item.title}</h3>
                      <span className="text-[10px] shrink-0" style={{ color: "#8ca5bc" }}>{timeAgo(item.created_at)}</span>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "#8ca5bc" }}>{item.message}</p>
                  </div>
                </button>
              );
            })}
            {!loading && items.length === 0 && (
              <div className="p-8 text-center">
                <Bell size={24} className="mx-auto mb-2" style={{ color: "#8ca5bc" }} />
                <p className="text-sm" style={{ color: "#8ca5bc" }}>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
