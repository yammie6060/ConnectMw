import { Check, CreditCard, Download, Receipt, ShieldCheck, Zap, Crown, Building, User2, Sparkle, Wrench, Home, TrendingUp } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { SessionUser } from '../types/dashboard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  price: string;
  priceRaw: number; // 0 = free
  period: string;
  description: string;
  badge: string;
  badgeColor: string;
  features: string[];
  cta: string;
  ctaStyle: 'primary' | 'ghost';
}

interface BillingPageProps {
  color: string;
  user: SessionUser;
}

// ─── Role plan data ───────────────────────────────────────────────────────────

const ROLE_PLANS: Record<string, { heading: string; icon: React.ElementType; plans: Plan[] }> = {
  customer: {
    heading: "Customer Plans",
    icon: User2,
    plans: [
      {
        id: "customer_free",
        name: "Explorer",
        price: "K0",
        priceRaw: 0,
        period: "forever",
        description: "Browse listings, book services, and track orders.",
        badge: "FREE",
        badgeColor: "#64748b",
        features: ["Browse all listings", "Up to 5 active bookings", "Order tracking", "Standard support"],
        cta: "Current Plan",
        ctaStyle: "ghost",
      },
      {
        id: "customer_plus",
        name: "Plus",
        price: "K2,500",
        priceRaw: 2500,
        period: "month",
        description: "Priority access and perks for frequent buyers.",
        badge: "POPULAR",
        badgeColor: "", // uses accent color
        features: ["Unlimited bookings", "Priority responses", "Booking reminders", "Order history export", "Early access to deals", "Email support"],
        cta: "Upgrade to Plus",
        ctaStyle: "primary",
      },
      {
        id: "customer_premium",
        name: "Premium",
        price: "K6,000",
        priceRaw: 6000,
        period: "month",
        description: "For power buyers and business procurement.",
        badge: "BEST VALUE",
        badgeColor: "#10b981",
        features: ["Everything in Plus", "Dedicated account manager", "Bulk order tools", "API access", "Exclusive member deals", "24/7 support"],
        cta: "Go Premium",
        ctaStyle: "ghost",
      },
    ],
  },

  landlord: {
    heading: "Landlord & Agent Plans",
    icon: Home,
    plans: [
      {
        id: "landlord_starter",
        name: "Starter",
        price: "K0",
        priceRaw: 0,
        period: "forever",
        description: "List your first properties and receive enquiries.",
        badge: "FREE",
        badgeColor: "#64748b",
        features: ["15 active listings", "Basic enquiries", "Basic analytics", "Standard support"],
        cta: "Current Plan",
        ctaStyle: "ghost",
      },
      {
        id: "landlord_pro",
        name: "Pro",
        price: "K4,500",
        priceRaw: 4500,
        period: "month",
        description: "For serious landlords who want to stand out.",
        badge: "POPULAR",
        badgeColor: "",
        features: ["Unlimited listings", "Priority enquiries", "Advanced analytics", "Profile boost", "Featured placement", "Email support"],
        cta: "Upgrade to Pro",
        ctaStyle: "primary",
      },
      {
        id: "landlord_agency",
        name: "Agency",
        price: "K12,500",
        priceRaw: 12500,
        period: "month",
        description: "For property agencies managing high volume.",
        badge: "ENTERPRISE",
        badgeColor: "#10b981",
        features: ["Everything in Pro", "Multi-agent accounts", "Custom branding", "Bulk listing tools", "API access", "Dedicated account manager", "24/7 phone support"],
        cta: "Contact Sales",
        ctaStyle: "ghost",
      },
    ],
  },

  beautyProvider: {
    heading: "Beauty Provider Plans",
    icon: Sparkle,
    plans: [
      {
        id: "beauty_free",
        name: "Free",
        price: "K0",
        priceRaw: 0,
        period: "forever",
        description: "Get discovered and accept your first bookings.",
        badge: "FREE",
        badgeColor: "#64748b",
        features: ["1 portfolio slot", "Up to 10 bookings/month", "Basic schedule view", "Standard support"],
        cta: "Current Plan",
        ctaStyle: "ghost",
      },
      {
        id: "beauty_pro",
        name: "Salon Pro",
        price: "K3,500",
        priceRaw: 3500,
        period: "month",
        description: "For busy providers growing their client base.",
        badge: "POPULAR",
        badgeColor: "",
        features: ["Unlimited bookings", "20-photo portfolio", "Schedule + reminders", "Review management", "Featured in search", "Email support"],
        cta: "Upgrade to Salon Pro",
        ctaStyle: "primary",
      },
      {
        id: "beauty_studio",
        name: "Studio",
        price: "K9,000",
        priceRaw: 9000,
        period: "month",
        description: "For salons and studios with multiple staff.",
        badge: "ENTERPRISE",
        badgeColor: "#10b981",
        features: ["Everything in Salon Pro", "Multi-staff accounts", "Custom booking page", "Analytics dashboard", "Priority listing", "24/7 support"],
        cta: "Contact Sales",
        ctaStyle: "ghost",
      },
    ],
  },

  spareSeller: {
    heading: "Spare Parts Seller Plans",
    icon: Wrench,
    plans: [
      {
        id: "spares_free",
        name: "Free",
        price: "K0",
        priceRaw: 0,
        period: "forever",
        description: "List your parts and start receiving enquiries.",
        badge: "FREE",
        badgeColor: "#64748b",
        features: ["20 part listings", "Basic enquiries", "Standard visibility", "Standard support"],
        cta: "Current Plan",
        ctaStyle: "ghost",
      },
      {
        id: "spares_dealer",
        name: "Dealer",
        price: "K4,000",
        priceRaw: 4000,
        period: "month",
        description: "For active sellers who need more visibility.",
        badge: "POPULAR",
        badgeColor: "",
        features: ["Unlimited listings", "Priority enquiries", "Advanced analytics", "Inventory tools", "Featured in search", "Email support"],
        cta: "Upgrade to Dealer",
        ctaStyle: "primary",
      },
      {
        id: "spares_wholesale",
        name: "Wholesale",
        price: "K11,000",
        priceRaw: 11000,
        period: "month",
        description: "For garages and wholesalers with bulk stock.",
        badge: "ENTERPRISE",
        badgeColor: "#10b981",
        features: ["Everything in Dealer", "Bulk CSV import", "API access", "Multi-user accounts", "Custom storefront", "Dedicated manager", "24/7 phone support"],
        cta: "Contact Sales",
        ctaStyle: "ghost",
      },
    ],
  },
};

// ─── Mock transaction data keyed by plan id ───────────────────────────────────
// In production this would come from your API. We show NO transactions if the
// user's active plan is the free tier (priceRaw === 0).

const MOCK_TRANSACTIONS: Record<string, { desc: string; amount: string; date: string; invoice: string }[]> = {
  landlord_pro: [
    { desc: "Pro Plan – April 2024",    amount: "K4,500", date: "Apr 1, 2024", invoice: "#INV-004" },
    { desc: "Pro Plan – March 2024",    amount: "K4,500", date: "Mar 1, 2024", invoice: "#INV-003" },
    { desc: "Pro Plan – February 2024", amount: "K4,500", date: "Feb 1, 2024", invoice: "#INV-002" },
    { desc: "Pro Plan – January 2024",  amount: "K4,500", date: "Jan 1, 2024", invoice: "#INV-001" },
  ],
  beauty_pro: [
    { desc: "Salon Pro – April 2024",   amount: "K3,500", date: "Apr 1, 2024", invoice: "#INV-004" },
    { desc: "Salon Pro – March 2024",   amount: "K3,500", date: "Mar 1, 2024", invoice: "#INV-003" },
  ],
  spares_dealer: [
    { desc: "Dealer Plan – April 2024", amount: "K4,000", date: "Apr 1, 2024", invoice: "#INV-002" },
    { desc: "Dealer Plan – March 2024", amount: "K4,000", date: "Mar 1, 2024", invoice: "#INV-001" },
  ],
  customer_plus: [
    { desc: "Plus Plan – April 2024",   amount: "K2,500", date: "Apr 1, 2024", invoice: "#INV-002" },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BillingPage({ color, user }: BillingPageProps) {
  const role = user.role as string;
  const roleMeta = ROLE_PLANS[role] ?? ROLE_PLANS.customer;
  const RoleIcon = roleMeta.icon;

  // Determine active plan: in a real app, read from user.subscription.planId
  // For the demo we derive it: if user has no subscription, the first plan (free) is current.
  // Swap "activePlanId" for a real field on SessionUser when you wire up the backend.
  const activePlanId: string = (user as any).activePlanId ?? roleMeta.plans[0].id;
  const activePlan = roleMeta.plans.find(p => p.id === activePlanId) ?? roleMeta.plans[0];
  const isOnFreePlan = activePlan.priceRaw === 0;

  const transactions = isOnFreePlan ? [] : (MOCK_TRANSACTIONS[activePlanId] ?? []);

  return (
    <PageShell
      title="Billing & Plans"
      subtitle="Manage your subscription and view payment history"
      color={color}
    >
      {/* ── Role badge ── */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
        >
          <RoleIcon size={13} />
          {roleMeta.heading}
        </div>

        {!isOnFreePlan && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "#10b98115", border: "1px solid #10b98130", color: "#10b981" }}
          >
            <TrendingUp size={12} />
            Active subscription
          </div>
        )}
      </div>

      {/* ── Plans grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {roleMeta.plans.map((plan) => {
          const isCurrent = plan.id === activePlanId;
          const isPopular = plan.ctaStyle === "primary";

          return (
            <div
              key={plan.id}
              className="rounded-2xl p-5 flex flex-col relative transition-all duration-200 hover:scale-[1.015]"
              style={{
                background: isPopular ? `${color}12` : "var(--bg-secondary, #132333)",
                border: isCurrent
                  ? `2px solid ${color}`
                  : isPopular
                  ? `1.5px solid ${color}50`
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: isCurrent ? `0 0 24px ${color}20` : "none",
              }}
            >
              {/* Current indicator */}
              {isCurrent && (
                <div
                  className="absolute -top-px left-5 right-5 h-0.5 rounded-b-full"
                  style={{ background: color }}
                />
              )}

              {/* Badge */}
              <span
                className="absolute -top-2.5 right-4 text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-widest"
                style={{
                  background: plan.badgeColor || color,
                  color: plan.badgeColor ? "#fff" : "#0d1f2d",
                }}
              >
                {isCurrent ? "✓ CURRENT" : plan.badge}
              </span>

              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}18`, color }}
              >
                {isPopular ? <Crown size={16} /> : plan.priceRaw === 0 ? <Zap size={16} /> : <Building size={16} />}
              </div>

              <h3 className="text-base font-black tracking-tight" style={{ color: "var(--text-primary, white)" }}>
                {plan.name}
              </h3>

              <div className="mt-1.5 mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-black" style={{ color: isCurrent ? color : "var(--text-primary, white)" }}>
                  {plan.price}
                </span>
                {plan.period !== "forever" && (
                  <span className="text-xs" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                    /{plan.period}
                  </span>
                )}
              </div>

              <p className="text-[11px] mb-4 leading-relaxed" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                {plan.description}
              </p>

              <div className="flex-1 space-y-2 mb-5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-soft, #cde0f0)" }}>
                    <Check size={11} className="mt-0.5 shrink-0" style={{ color: "#10b981" }} />
                    {f}
                  </div>
                ))}
              </div>

              <button
                disabled={isCurrent}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                style={
                  !isCurrent && plan.ctaStyle === "primary"
                    ? { background: color, color: "#0d1f2d" }
                    : { background: "transparent", color, border: `1px solid ${color}35` }
                }
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Bottom grid: payment method + billing info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Payment method */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18`, color }}>
            <CreditCard size={16} />
          </div>
          <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary, white)" }}>
            Payment Method
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
            {isOnFreePlan
              ? "Add a payment method to upgrade your plan."
              : "Your subscription renews automatically each month."}
          </p>

          {!isOnFreePlan && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-4"
              style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-8 h-5 rounded bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-[7px] font-black text-white">VISA</span>
              </div>
              <span className="text-sm font-mono" style={{ color: "var(--text-primary, white)" }}>
                •••• •••• •••• 4242
              </span>
              <span className="ml-auto text-xs" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                Exp 12/26
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110"
              style={{ background: "var(--bg-elevated, #1a2e42)", color, border: `1px solid ${color}30` }}
            >
              {isOnFreePlan ? "Add payment method" : "Replace card"}
            </button>
            {!isOnFreePlan && (
              <button
                className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                Cancel subscription
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
            <ShieldCheck size={12} style={{ color: "#10b981" }} />
            Payments are protected with secure checkout.
          </div>
        </div>

        {/* Billing info */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h3
            className="text-[10px] font-bold uppercase tracking-widest mb-4"
            style={{ color: "var(--text-secondary, #8ca5bc)" }}
          >
            Billing Info
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-[11px] mb-0.5" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Plan</div>
              <div className="font-bold" style={{ color }}>
                {activePlan.name}
              </div>
            </div>
            <div>
              <div className="text-[11px] mb-0.5" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Next billing date</div>
              <div className="font-medium" style={{ color: "var(--text-primary, white)" }}>
                {isOnFreePlan ? "—" : "May 1, 2024"}
              </div>
            </div>
            <div>
              <div className="text-[11px] mb-0.5" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Billing email</div>
              <div className="font-medium truncate" style={{ color: "var(--text-primary, white)" }}>
                {user.email ?? "user@example.com"}
              </div>
            </div>
            <button
              className="w-full py-2 rounded-lg text-xs font-semibold mt-1"
              style={{ background: "var(--bg-elevated, #1a2e42)", color }}
            >
              Update billing info
            </button>
          </div>
        </div>
      </div>

      {/* ── Transaction history ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="px-5 py-3 border-b border-white/5 flex items-center justify-between"
        >
          <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
            Transaction History
          </h3>
          <Receipt size={14} style={{ color: "var(--text-secondary, #8ca5bc)" }} />
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--bg-elevated, #1a2e42)" }}
            >
              <Receipt size={20} style={{ color: "var(--text-secondary, #8ca5bc)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary, white)" }}>
              No transactions yet
            </p>
            <p className="text-xs text-center max-w-[240px]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
              {isOnFreePlan
                ? "Upgrade your plan to unlock more features — your billing history will appear here."
                : "Your payments will appear here once processed."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div
              className="hidden md:grid grid-cols-12 gap-3 px-5 py-2 text-[11px] font-medium border-b border-white/5"
              style={{ color: "var(--text-secondary, #8ca5bc)" }}
            >
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Invoice</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {transactions.map((tx, i) => (
              <div
                key={i}
                className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-3 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 md:col-span-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--bg-elevated, #1a2e42)", color }}
                  >
                    <Receipt size={13} />
                  </div>
                  <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary, white)" }}>
                    {tx.desc}
                  </span>
                </div>

                <div className="flex justify-between md:contents">
                  <span className="text-xs md:hidden" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Date</span>
                  <span className="text-sm md:col-span-2 self-center" style={{ color: "var(--text-primary, white)" }}>{tx.date}</span>

                  <span className="text-xs md:hidden" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Invoice</span>
                  <span className="text-sm font-mono md:col-span-2 self-center" style={{ color: "var(--text-soft, #cde0f0)" }}>{tx.invoice}</span>

                  <span className="text-xs md:hidden" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Amount</span>
                  <span className="text-sm font-bold md:col-span-2 self-center md:text-right" style={{ color }}>{tx.amount}</span>

                  <div className="md:col-span-1 flex items-center justify-end gap-2 self-center">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#10b98115", color: "#10b981" }}
                    >
                      PAID
                    </span>
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
                      style={{ color: "var(--text-secondary, #8ca5bc)" }}
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </PageShell>
  );
}