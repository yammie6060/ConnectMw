import { LogOut, X } from "lucide-react";

interface LogoutConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({ onCancel, onConfirm }: LogoutConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.48)", animation: "fadeIn 0.18s ease" }}>
      <div
        className="w-full max-w-[390px] rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-secondary, #132333)",
          border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
          boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
        }}
      >
        <div className="p-5 flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
            <LogOut size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-black" style={{ color: "var(--text-primary, white)" }}>Sign out?</h2>
            <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
              You will leave the dashboard and return to the sign-in page.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg-muted, rgba(255,255,255,0.05))", color: "var(--text-secondary, #8ca5bc)" }}
            aria-label="Cancel sign out"
          >
            <X size={15} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-5 pt-0">
          <button
            onClick={onCancel}
            className="rounded-xl py-2.5 text-sm font-bold"
            style={{ background: "var(--bg-muted, rgba(255,255,255,0.05))", color: "var(--text-primary, white)" }}
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl py-2.5 text-sm font-bold"
            style={{ background: "#ef4444", color: "#ffffff" }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
