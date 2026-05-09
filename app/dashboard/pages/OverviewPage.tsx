import { MapPin, ChevronRight } from 'lucide-react';
import { NavItem, RoleMeta, SessionUser } from '../types/dashboard';

interface OverviewPageProps {
  user: SessionUser;
  meta: RoleMeta;
  navItems: NavItem[];
  setActiveItem: (id: string) => void;
}

export function OverviewPage({ user, meta, navItems, setActiveItem }: OverviewPageProps) {
  const { color } = meta;
  const RoleIcon = meta.icon;
  const displayName = user.businessName || user.companyName || user.garageName || `${user.firstName} ${user.lastName}`;

  return (
    <div style={{ animation: "fadeIn 0.2s ease" }} className="py-5 sm:py-6">
    

      <div className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-7 mb-5 sm:mb-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--bg-secondary, #132333) 0%, var(--bg-elevated, #1a2e42) 100%)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))", boxShadow: "0 18px 45px var(--shadow-color, rgba(0,0,0,0.22))" }}>
        <div className="absolute top-0 right-0 w-56 h-56 pointer-events-none rounded-full"
          style={{ background: `radial-gradient(circle, ${color}14 0%, transparent 70%)`, transform: "translate(25%,-25%)" }} />


        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2"
              style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}>
              <RoleIcon size={11} /> {meta.label}
            </span>
            <h1 className="text-xl md:text-2xl font-black mb-0.5 leading-tight" style={{ color: "var(--text-primary, white)" }}>Hello, {user.firstName}!</h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{meta.greeting}</p>
          </div>
          <div className="sm:text-right">
            <div className="text-[11px]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Signed in as</div>
            <div className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{displayName}</div>
            <div className="text-[11px] break-all" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{user.email}</div>
            <div className="flex items-center gap-1 mt-1 sm:justify-end text-[11px]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
              <MapPin size={9} /> Lilongwe, Malawi
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 sm:mb-6">
        {meta.statCards.map((card: any) => {
          const CardIcon = card.icon;
          return (
            <div key={card.label} className="rounded-xl p-4 min-h-[132px] transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: "var(--bg-secondary, #132333)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <CardIcon size={15} style={{ color }} />
              </div>
              <div className="text-2xl font-black mb-1 leading-none" style={{ color }}>{card.value}</div>
              <div className="text-xs" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{card.label}</div>
              {card.delta && <div className="text-[10px] mt-1 font-medium" style={{ color: "#10b981" }}>{card.delta}</div>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-xl p-4 sm:p-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
          <h2 className="text-[11px] font-bold mb-4 uppercase tracking-widest" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5">
            {navItems.filter(i => i.id !== "overview" && i.id !== "settings").slice(0, 4).map((action) => {
              const ActionIcon = action.icon;
              return (
                <button key={action.id} onClick={() => setActiveItem(action.id)}
                  className="flex flex-col items-center gap-2 p-3 min-h-[88px] rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-0 relative"
                  style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid var(--border-color, rgba(255,255,255,0.06))" }}>
                  {action.badge && (
                    <span className="absolute top-2 right-2 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center bg-[#f5ab20] text-[#0d1f2d]">
                      {action.badge}
                    </span>
                  )}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                    <ActionIcon size={15} style={{ color }} />
                  </div>
                  <span className="text-[10px] text-center font-medium leading-tight" style={{ color: "var(--text-soft, #cde0f0)" }}>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl p-4 sm:p-5" >
          <h2 className="text-[11px] font-bold mb-4 uppercase tracking-widest" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Recent Activity</h2>
          <div className="flex flex-col gap-2.5">
            {meta.recentItems.map((item: any) => (
              <div key={item.title} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:translate-x-0.5"
                style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid var(--border-color, rgba(255,255,255,0.06))" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.badgeColor }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary, white)" }}>{item.title}</div>
                  <div className="text-[11px] truncate" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{item.sub}</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${item.badgeColor}22`, color: item.badgeColor, border: `1px solid ${item.badgeColor}44` }}>
                  {item.badge}
                </span>
                <ChevronRight size={13} className="flex-shrink-0" style={{ color: "var(--text-secondary, #8ca5bc)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
