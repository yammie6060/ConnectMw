import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Package, Clock, CheckCircle2, XCircle, Truck, ChevronDown, ChevronUp } from 'lucide-react';

const ORDERS = [
  {
    id: 1, ref: "#ORD-001",
    title: "Toyota Vitz Side Mirror (Right)",
    seller: "AutoParts MW – Lilongwe",
    price: "K8,500", date: "May 7, 2024",
    status: "Quote Received",
    statusColor: "#f5ab20",
    statusIcon: Clock,
    steps: ["Enquiry Sent", "Quote Received", "Order Confirmed", "Delivered"],
    currentStep: 1,
  },
  {
    id: 2, ref: "#ORD-002",
    title: "Brake Pads – Nissan Wingroad (Rear)",
    seller: "Sparks & Gears – Blantyre",
    price: "K6,200", date: "May 5, 2024",
    status: "Pending",
    statusColor: "#8ca5bc",
    statusIcon: Clock,
    steps: ["Enquiry Sent", "Quote Received", "Order Confirmed", "Delivered"],
    currentStep: 0,
  },
  {
    id: 3, ref: "#ORD-003",
    title: "Mazda Familia Oil Filter",
    seller: "City Auto Spares – Zomba",
    price: "K1,800", date: "Apr 28, 2024",
    status: "Delivered",
    statusColor: "#10b981",
    statusIcon: CheckCircle2,
    steps: ["Enquiry Sent", "Quote Received", "Order Confirmed", "Delivered"],
    currentStep: 3,
  },
  {
    id: 4, ref: "#ORD-004",
    title: "Toyota Hiace Headlight Assembly",
    seller: "Blantyre Auto Spares",
    price: "K22,000", date: "Apr 15, 2024",
    status: "Cancelled",
    statusColor: "#ef4444",
    statusIcon: XCircle,
    steps: ["Enquiry Sent", "Quote Received", "Order Confirmed", "Delivered"],
    currentStep: -1, // cancelled
  },
];

interface OrdersPageProps { color: string }

export function OrdersPage({ color }: OrdersPageProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [tab, setTab] = useState<'all' | 'active' | 'completed'>('all');

  const filtered = ORDERS.filter(o => {
    if (tab === 'active')    return !['Delivered','Cancelled'].includes(o.status);
    if (tab === 'completed') return ['Delivered','Cancelled'].includes(o.status);
    return true;
  });

  return (
    <PageShell title="My Orders" subtitle="Track your spare part enquiries and orders" color={color}>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-secondary, #132333)' }}>
        {(['all','active','completed'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
            style={tab === t ? { background: color, color: '#0d1f2d' } : { background: 'transparent', color: '#8ca5bc' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map(o => {
          const StatusIcon = o.statusIcon;
          const isExpanded = expanded === o.id;
          const isCancelled = o.status === 'Cancelled';

          return (
            <div key={o.id} className="rounded-2xl overflow-hidden transition-all"
              style={{ background: 'var(--bg-secondary, #132333)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Main row */}
              <div className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${o.statusColor}15` }}>
                  <Package size={16} style={{ color: o.statusColor }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary, white)' }}>{o.title}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#8ca5bc' }}>{o.seller}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0 flex items-center gap-1"
                      style={{ background: `${o.statusColor}18`, color: o.statusColor }}>
                      <StatusIcon size={10} /> {o.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-xs font-black" style={{ color }}>{o.price}</span>
                    <span className="text-[11px]" style={{ color: '#8ca5bc' }}>{o.ref}</span>
                    <span className="text-[11px]" style={{ color: '#8ca5bc' }}>{o.date}</span>
                  </div>
                </div>

                <button onClick={() => setExpanded(isExpanded ? null : o.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-colors hover:bg-white/5"
                  style={{ color: '#8ca5bc' }}>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Expanded: progress tracker */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1">
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated, #1a2e42)' }}>
                    {isCancelled ? (
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#ef4444' }}>
                        <XCircle size={16} /> This order was cancelled
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {o.steps.map((step, i) => {
                          const done = i <= o.currentStep;
                          const current = i === o.currentStep;
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                                  style={{
                                    background: done ? color : 'rgba(255,255,255,0.08)',
                                    color: done ? '#0d1f2d' : '#8ca5bc',
                                    boxShadow: current ? `0 0 0 3px ${color}30` : 'none',
                                  }}>
                                  {done && !current ? '✓' : i + 1}
                                </div>
                                <span className="text-[9px] text-center w-14 leading-tight"
                                  style={{ color: done ? 'var(--text-primary, white)' : '#8ca5bc' }}>
                                  {step}
                                </span>
                              </div>
                              {i < o.steps.length - 1 && (
                                <div className="flex-1 h-0.5 -mt-4 mx-1 rounded-full transition-all"
                                  style={{ background: i < o.currentStep ? color : 'rgba(255,255,255,0.08)' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {o.status === 'Quote Received' && (
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 py-2 rounded-xl text-xs font-bold"
                          style={{ background: color, color: '#0d1f2d' }}>
                          Accept Quote
                        </button>
                        <button className="flex-1 py-2 rounded-xl text-xs font-bold"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}