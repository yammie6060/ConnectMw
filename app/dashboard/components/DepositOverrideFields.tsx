import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";

export type DepositOverrideForm = {
  mode: "inherit" | "none" | "full" | "deposit";
  amount: string; // only used when mode === "deposit"
};

export const emptyDepositOverride: DepositOverrideForm = { 
  mode: "inherit", 
  amount: "" 
};

export function depositOverrideFromListing(item: {
  deposit_required?: boolean | null;
  deposit_type?: string | null;
  deposit_amount?: number | null;
}): DepositOverrideForm {
  if (item.deposit_required == null) return { mode: "inherit", amount: "" };
  if (!item.deposit_required) return { mode: "none", amount: "" };
  if (item.deposit_type === "full") return { mode: "full", amount: "" };
  return { mode: "deposit", amount: item.deposit_amount != null ? String(item.deposit_amount) : "" };
}

export function depositOverrideToPayload(form: DepositOverrideForm) {
  if (form.mode === "inherit") return { deposit_required: null, deposit_type: null, deposit_amount: null };
  if (form.mode === "none") return { deposit_required: false, deposit_type: "none", deposit_amount: null };
  if (form.mode === "full") return { deposit_required: true, deposit_type: "full", deposit_amount: null };
  return { deposit_required: true, deposit_type: "deposit", deposit_amount: form.amount ? Number(form.amount) : null };
}

function money(value?: number | null) {
  return value == null ? "not set" : `K${value.toLocaleString()}`;
}

/** Turns a provider's raw deposit_* fields into a human label for "what inherit means here". */
export function providerDepositLabel(provider: {
  deposit_required?: boolean | null;
  deposit_type?: string | null;
  deposit_amount?: number | null;
} | undefined) {
  if (!provider?.deposit_required || provider.deposit_type === "none") return "No deposit";
  if (provider.deposit_type === "full") return "Full amount upfront";
  return `${money(provider.deposit_amount)} (capped to item price)`;
}

export function DepositOverrideFields({
  form,
  onChange,
  accountDefaultLabel,
}: {
  form: DepositOverrideForm;
  onChange: (form: DepositOverrideForm) => void;
  accountDefaultLabel: string;
}) {
  const [open, setOpen] = useState(form.mode !== "inherit");

  return (
    <div className="rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5"
      >
        <span className="text-xs font-semibold text-white">Deposit for this listing</span>
        <ChevronDown size={14} className="text-white transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {open && (
        <div className="p-3 flex flex-col gap-3">
          <div className="flex items-start gap-2 rounded-lg p-2.5 bg-[#1a2e42]/50 border border-white/5">
            <Info size={13} className="text-[#8ca5bc] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#cde0f0]">
              Account default: <strong className="text-white">{accountDefaultLabel}</strong>. Override only if this item needs a different rule.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8ca5bc] mb-1.5 uppercase">
              Deposit rule
            </label>
            <select
              value={form.mode}
              onChange={(e) => onChange({ ...form, mode: e.target.value as DepositOverrideForm["mode"] })}
              className="w-full bg-[#1a2e42] border border-white/9 rounded-[10px] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#f5ab20] transition-colors"
            >
              <option value="inherit">Use account default</option>
              <option value="none">Never require a deposit for this item</option>
              <option value="full">Require full payment upfront</option>
              <option value="deposit">Require a fixed deposit amount</option>
            </select>
          </div>

          {form.mode === "deposit" && (
            <div>
              <label className="block text-[11px] font-semibold text-[#8ca5bc] mb-1.5 uppercase">
                Deposit amount (MWK)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => onChange({ ...form, amount: e.target.value })}
                placeholder="5000"
                className="w-full bg-[#1a2e42] border border-white/9 rounded-[10px] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#f5ab20] transition-colors"
              />
              <p className="text-[10px] mt-1.5 text-[#8ca5bc]">
                Automatically capped to this item's price if the price is lower — a K5,000 deposit rule never exceeds a K3,000 item.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}