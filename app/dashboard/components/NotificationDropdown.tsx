// NotificationDropdown.tsx
import { useEffect, useRef } from 'react';
import { Bell, Package, Home, Sparkles, MessageSquare, X } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAll: () => void;
  color: string;
  anchorRef?: React.RefObject<HTMLButtonElement>; // pass the bell button ref
}

const MOCK_NOTIFS = [
  { id: 1, icon: MessageSquare, text: "New message from Chimwemwe", time: "2m ago", unread: true },
  { id: 2, icon: Home,          text: "Your booking was confirmed",  time: "1h ago", unread: true },
  { id: 3, icon: Package,       text: "Order #INV-002 is ready",     time: "3h ago", unread: false },
  { id: 4, icon: Sparkles,      text: "New deal in your area",       time: "Yesterday", unread: false },
];

export function NotificationDropdown({ isOpen, onClose, onNavigateToAll, color }: NotificationDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // slight delay so the open-click doesn't immediately close
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Fixed overlay anchor — sits above everything
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: '68px',        // topbar height (60px) + 8px gap
        right: '16px',
        width: '320px',
        zIndex: 9999,       // above topbar z-20
        background: 'var(--bg-secondary, #132333)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        animation: 'slideDown 0.18s ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <Bell size={14} style={{ color }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary, white)' }}>Notifications</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
            {MOCK_NOTIFS.filter(n => n.unread).length}
          </span>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors" style={{ color: '#8ca5bc' }}>
          <X size={13} />
        </button>
      </div>

      {/* Items */}
      <div>
        {MOCK_NOTIFS.map(n => {
          const Icon = n.icon;
          return (
            <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: n.unread ? `${color}06` : 'transparent' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${color}18`, color }}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed" style={{ color: n.unread ? 'var(--text-primary, white)' : 'var(--text-secondary, #8ca5bc)' }}>
                  {n.text}
                </p>
                <span className="text-[10px]" style={{ color: '#8ca5bc' }}>{n.time}</span>
              </div>
              {n.unread && <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <button onClick={onNavigateToAll} className="w-full py-3 text-xs font-semibold transition-colors hover:bg-white/[0.03]"
        style={{ color, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        View all notifications →
      </button>
    </div>
  );
}