import { PageShell } from '../components/PageShell';
import { Check, CreditCard, Download, Receipt, ShieldCheck, Zap } from 'lucide-react';

interface BillingPageProps {
  color: string;
}

export function BillingPage({ color }: BillingPageProps) {
  const features = ["15 active listings", "Priority enquiries", "Basic analytics", "Profile boost"];
  const transactions = [
    { desc: "Pro Plan - April", amount: "K4,500", date: "Apr 1", status: "Paid" },
    { desc: "Pro Plan - March", amount: "K4,500", date: "Mar 1", status: "Paid" },
  ];

  return (
    <PageShell title="Billing & Plans" subtitle="Manage your subscription, payment method, and invoices" color={color}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>Current Plan</span>
              <h2 className="text-2xl font-black mt-2" style={{ color: "var(--text-primary, white)" }}>Starter</h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Free plan for getting started on ConnectMW.</p>
            </div>
            <span className="self-start text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: color, color: "#0d1f2d" }}>FREE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {features.map(feature => (
              <div key={feature} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-soft, #cde0f0)" }}>
                <Check size={14} style={{ color: "#10b981" }} />
                {feature}
              </div>
            ))}
          </div>

          <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2" style={{ background: color, color: "#0d1f2d" }}>
            <Zap size={15} /> Upgrade to Pro
          </button>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}18`, color }}>
            <CreditCard size={18} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary, white)" }}>Payment Method</h3>
          <p className="text-xs mt-1 mb-4" style={{ color: "var(--text-secondary, #8ca5bc)" }}>No card or mobile money account is connected.</p>
          <button className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--bg-elevated, #1a2e42)", color, border: `1px solid ${color}30` }}>
            Add payment method
          </button>
          <div className="mt-4 flex items-start gap-2 text-[11px]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
            <ShieldCheck size={13} style={{ color: "#10b981", flexShrink: 0 }} />
            Payments are protected with secure checkout.
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden mt-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Transaction History</h3>
          <Receipt size={15} style={{ color: "var(--text-secondary, #8ca5bc)" }} />
        </div>
        {transactions.map((tx, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-white/5 last:border-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--bg-elevated, #1a2e42)", color }}>
              <Receipt size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary, white)" }}>{tx.desc}</div>
              <div className="text-[11px]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{tx.date}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold" style={{ color }}>{tx.amount}</div>
              <div className="text-[10px]" style={{ color: "#10b981" }}>{tx.status}</div>
            </div>
            <button className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center" style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-secondary, #8ca5bc)" }}>
              <Download size={14} />
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
