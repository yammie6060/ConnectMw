import { Bell, CalendarCheck, CheckCircle2, MessageSquare, Package, Star, ChevronRight } from "lucide-react";
import { PageShell } from "../components/PageShell";

const NOTIFICATIONS = [
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
  {
    id: 4,
    title: "Review prompt",
    detail: "You can leave a review for your recent completed service.",
    time: "2 days ago",
    unread: false,
    icon: Star,
  },
];

interface NotificationsPageProps {
  color: string;
}

export function NotificationsPage({ color }: NotificationsPageProps) {
  const unreadCount = NOTIFICATIONS.filter((item) => item.unread).length;

  return (
    <PageShell title="Notifications" subtitle="Updates from your activity" color={color}>
      <style jsx>{`
        .notification-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 1024px) {
          .notification-container {
            grid-template-columns: 1fr 2fr;
          }
        }

        .stat-card {
          border-radius: 0.75rem;
          padding: 1.25rem;
          background: var(--bg-secondary, #132333);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
          display: flex;
          flex-direction: column;
        }

        .stat-icon {
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          background: color-mix(in srgb, currentColor 10%, transparent);
          color: currentColor;
        }

        .stat-number {
          font-size: 1.875rem;
          font-weight: 900;
          line-height: 1;
          color: currentColor;
        }

        .stat-label {
          font-size: 0.875rem;
          margin-top: 0.5rem;
          color: var(--text-secondary, #8ca5bc);
        }

        .notifications-list {
          border-radius: 0.75rem;
          overflow: hidden;
          background: var(--bg-secondary, #132333);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
          display: flex;
          flex-direction: column;
        }

        .notifications-header {
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
          background: rgba(255, 255, 255, 0.02);
        }

        .notifications-header-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-secondary, #8ca5bc);
        }

        .notifications-body {
          overflow-y: auto;
          max-height: 600px;
        }

        .notification-item {
          width: 100%;
          text-align: left;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
          transition: background-color 0.15s ease;
          cursor: pointer;
          background: transparent;
          border: none;
        }

        .notification-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .notification-item:active {
          background: rgba(255, 255, 255, 0.08);
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-icon {
          position: relative;
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: currentColor;
          background: color-mix(in srgb, currentColor 8%, transparent);
        }

        .notification-unread-indicator {
          position: absolute;
          right: -0.25rem;
          top: -0.25rem;
          width: 0.625rem;
          height: 0.625rem;
          border-radius: 9999px;
          background: currentColor;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .notification-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary, white);
          margin: 0;
        }

        .notification-time {
          font-size: 0.625rem;
          flex-shrink: 0;
          color: var(--text-secondary, #8ca5bc);
        }

        .notification-detail {
          font-size: 0.75rem;
          line-height: 1.4;
          margin-top: 0.375rem;
          color: var(--text-secondary, #8ca5bc);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .empty-state {
          padding: 2rem 1.25rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 200px;
        }

        .empty-state-text {
          font-size: 0.875rem;
          color: var(--text-secondary, #8ca5bc);
        }
      `}</style>

      <div className="notification-container">
        {/* Stats Card */}
        <div className="stat-card" style={{ color }}>
          <div className="stat-icon">
            <Bell size={20} />
          </div>
          <div className="stat-number">{unreadCount}</div>
          <p className="stat-label">
            unread notification{unreadCount === 1 ? "" : "s"} waiting for you.
          </p>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          <div className="notifications-header">
            <h2 className="notifications-header-title">Recent Notifications</h2>
            <CheckCircle2 size={15} style={{ color }} />
          </div>

          <div className="notifications-body">
            {NOTIFICATIONS.length > 0 ? (
              NOTIFICATIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className="notification-item"
                    style={{ color }}
                  >
                    <div className="notification-icon">
                      <Icon size={16} />
                      {item.unread && <span className="notification-unread-indicator" />}
                    </div>

                    <div className="notification-content">
                      <div className="notification-header-row">
                        <h3 className="notification-title">{item.title}</h3>
                        <span className="notification-time">{item.time}</span>
                      </div>
                      <p className="notification-detail">{item.detail}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="empty-state">
                <Bell size={24} style={{ color: "var(--text-secondary, #8ca5bc)" }} />
                <p className="empty-state-text">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
