import React from "react";
import { ManagedPayment } from "@/services/admin.service";

interface PaymentsSectionProps {
  payments: ManagedPayment[];
  color: string;
}

export function PaymentsSection({ payments, color }: PaymentsSectionProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--bg-secondary, #132333)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="p-3 sm:p-4 border-b border-white/5 last:border-b-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate text-sm sm:text-base" style={{ color: "var(--text-primary, white)" }}>
              {payment.payment_type}
            </div>
            <div className="text-xs mt-0.5 truncate" style={{ color: "#8ca5bc" }}>
              {payment.user?.email || "No user"}
              {payment.transaction_reference && <> · {payment.transaction_reference}</>}
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
            <span className="text-sm font-black" style={{ color }}>
              {payment.currency} {payment.amount.toLocaleString()}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${color}18`, color }}
            >
              {payment.status}
            </span>
          </div>
        </div>
      ))}
      {payments.length === 0 && (
        <div className="p-5 text-sm" style={{ color: "#8ca5bc" }}>
          No payments found.
        </div>
      )}
    </div>
  );
}