import { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, Banknote, Clock, Receipt, Wallet } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { SessionUser } from "../types/dashboard";
import { providerService, ProviderWallet } from "@/services/provider.service";

type WalletPageProps = {
  color: string;
  user: SessionUser;
};

function formatMoney(value: number, currency = "MWK") {
  const prefix = currency === "MWK" ? "K" : `${currency} `;
  return `${prefix}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function WalletPage({ color, user }: WalletPageProps) {
  const [wallet, setWallet] = useState<ProviderWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    providerService
      .getWallet(user.activeProviderId || undefined)
      .then((res) => setWallet(res.data ?? null))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load wallet."))
      .finally(() => setLoading(false));
  }, [user.activeProviderId]);

  const transactions = wallet?.transactions ?? [];
  const totalEarned = useMemo(
    () => transactions.reduce((sum, item) => sum + item.amount, 0),
    [transactions],
  );

  return (
    <PageShell title="Wallet" subtitle="Balance, earnings history, and withdrawals" color={color}>
      {error && <div className="mb-3 text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</div>}
      {loading && <div className="text-sm" style={{ color: "#8ca5bc" }}>Loading wallet...</div>}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="rounded-2xl p-5 md:col-span-2" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#8ca5bc" }}>Available Balance</div>
                  <div className="text-4xl font-black" style={{ color }}>
                    {formatMoney(wallet?.available_balance ?? 0, wallet?.currency)}
                  </div>
                  <p className="text-xs mt-2 max-w-md" style={{ color: "#8ca5bc" }}>
                    Earnings shown here come only from completed transactions linked to your provider account.
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}18`, color }}>
                  <Wallet size={20} />
                </div>
              </div>
              <button
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black disabled:opacity-50"
                style={{ background: color, color: "#0d1f2d" }}
                disabled={(wallet?.available_balance ?? 0) <= 0}
              >
                <ArrowDownToLine size={14} />
                Withdraw
              </button>
            </div>

            <div className="rounded-2xl p-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}18`, color }}>
                <Banknote size={16} />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[11px]" style={{ color: "#8ca5bc" }}>Total earned</div>
                  <div className="text-xl font-black" style={{ color: "var(--text-primary, white)" }}>{formatMoney(totalEarned, wallet?.currency)}</div>
                </div>
                <div>
                  <div className="text-[11px]" style={{ color: "#8ca5bc" }}>Pending</div>
                  <div className="text-xl font-black" style={{ color: "var(--text-primary, white)" }}>{formatMoney(wallet?.pending_balance ?? 0, wallet?.currency)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#8ca5bc" }}>Transaction History</h3>
              <Receipt size={14} style={{ color: "#8ca5bc" }} />
            </div>

            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <Clock size={26} style={{ color: "#8ca5bc" }} />
                <p className="text-sm" style={{ color: "var(--text-primary, white)" }}>No earnings yet</p>
                <p className="text-xs max-w-xs" style={{ color: "#8ca5bc" }}>Completed jobs and paid orders will appear here once they belong to this provider workspace.</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={`${tx.source}-${tx.id}`} className="px-5 py-4 border-b border-white/5 last:border-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: "var(--text-primary, white)" }}>{tx.description}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "#8ca5bc" }}>
                      {tx.customer || "Customer"} - {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ""}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full capitalize w-fit" style={{ background: "#10b98118", color: "#10b981" }}>
                    {tx.status}
                  </span>
                  <div className="text-sm font-black sm:text-right" style={{ color }}>{formatMoney(tx.amount, tx.currency)}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
