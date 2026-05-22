import React from "react";
import { X, Mail, Phone, Building2 } from "lucide-react";
import { ManagedUser } from "@/services/admin.service";

interface UserDetailProps {
  user: ManagedUser;
  color: string;
  onClose: () => void;
}

export function UserDetail({ user, color, onClose }: UserDetailProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(3,10,18,0.75)" }}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{
          background: "var(--bg-secondary, #132333)",
          border: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3"
          style={{
            background: "var(--bg-secondary, #132333)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="min-w-0">
            <h3
              className="text-base font-black truncate"
              style={{ color: "var(--text-primary, white)" }}
            >
              {user.profile?.full_name || user.email}
            </h3>
            <p className="text-xs" style={{ color: "#8ca5bc" }}>
              User details and provider workspaces
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              className="rounded-xl p-3 flex items-center gap-2"
              style={{ background: "var(--bg-elevated, #1a2e42)" }}
            >
              <Mail size={13} style={{ color, flexShrink: 0 }} />
              <span className="text-xs break-all" style={{ color: "#cde0f0" }}>
                {user.email}
              </span>
            </div>
            <div
              className="rounded-xl p-3 flex items-center gap-2"
              style={{ background: "var(--bg-elevated, #1a2e42)" }}
            >
              <Phone size={13} style={{ color, flexShrink: 0 }} />
              <span className="text-xs" style={{ color: "#cde0f0" }}>
                {user.phone || "Not set"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {user.roles.map((role) => (
              <span
                key={role}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${color}18`, color }}
              >
                {role}
              </span>
            ))}
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={
                user.is_active
                  ? { background: "#10b98120", color: "#10b981" }
                  : { background: "#ef444420", color: "#ef4444" }
              }
            >
              {user.is_active ? "active" : "suspended"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { label: "City", value: user.profile?.city },
              { label: "District", value: user.profile?.district },
              {
                label: "Created",
                value: user.created_at ? new Date(user.created_at).toLocaleDateString() : undefined,
              },
              {
                label: "Last login",
                value: user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : "Never",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-3"
                style={{ background: "var(--bg-elevated, #1a2e42)", color: "#8ca5bc" }}
              >
                {label}
                <br />
                <strong style={{ color: "var(--text-primary, white)" }}>
                  {value || "Not set"}
                </strong>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "#8ca5bc" }}>
              Provider Workspaces
            </h4>
            <div className="space-y-2">
              {user.providers.map((provider) => (
                <div
                  key={provider.id}
                  className="rounded-xl p-3 flex items-start gap-3"
                  style={{ background: "var(--bg-elevated, #1a2e42)" }}
                >
                  <Building2 size={14} style={{ color, flexShrink: 0, marginTop: 1 }} />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-bold truncate"
                      style={{ color: "var(--text-primary, white)" }}
                    >
                      {provider.business_name || provider.display_name || "Provider"}
                    </div>
                    <div className="text-xs truncate" style={{ color: "#8ca5bc" }}>
                      {provider.display_name || provider.type || "Provider"}
                      {provider.physical_address && <> · {provider.physical_address}</>}
                    </div>
                  </div>
                  <span
                    className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${provider.is_verified ? "#10b981" : "#f5ab20"}20`,
                      color: provider.is_verified ? "#10b981" : "#f5ab20",
                    }}
                  >
                    {provider.verification_status}
                  </span>
                </div>
              ))}
              {user.providers.length === 0 && (
                <div
                  className="rounded-xl p-4 text-sm"
                  style={{ background: "var(--bg-elevated, #1a2e42)", color: "#8ca5bc" }}
                >
                  No provider workspaces.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}