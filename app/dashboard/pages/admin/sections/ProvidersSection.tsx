import React from "react";
import { Check, Loader2 } from "lucide-react";
import { UserWithProvider, AdminProviderCreatePayload, OwnerProviderFormData, OwnerProviderFormUpdateHandler, ProviderFormUpdateHandler } from "@/types";
import { ProviderTypeOption } from "@/services/provider.service";
import { OwnerProviderForm } from "../components/OwnerProviderForm";
import { inputStyle } from "@/constants";

interface ProvidersSectionProps {
  pendingProviders: UserWithProvider[];
  providerTypes: ProviderTypeOption[];
  providerForms: Record<string, AdminProviderCreatePayload>;
  ownerProviderForm: OwnerProviderFormData;
  actionLoading: Record<string, boolean>;
  color: string;
  canManageRoles: boolean;
  onUpdateProviderForm: ProviderFormUpdateHandler;
  onCreateProviderWorkspace: (userId: string) => Promise<void>;
  onOwnerProviderFormChange: OwnerProviderFormUpdateHandler;
  onOwnerProviderSubmit: (e: React.FormEvent) => Promise<void>;
  onSetProviderStatus: (userId: string, providerId: string, status: "approved" | "rejected") => Promise<void>;
}

export function ProvidersSection({
  pendingProviders,
  providerTypes,
  providerForms,
  ownerProviderForm,
  actionLoading,
  color,
  canManageRoles,
  onUpdateProviderForm,
  onCreateProviderWorkspace,
  onOwnerProviderFormChange,
  onOwnerProviderSubmit,
  onSetProviderStatus,
}: ProvidersSectionProps) {
  return (
    <div className="space-y-4">
      {/* Owner Provider Registration Form */}
      <OwnerProviderForm
        providerTypes={providerTypes}
        formData={ownerProviderForm}
        loading={!!actionLoading["owner-provider:create"]}
        color={color}
        onChange={onOwnerProviderFormChange}
        onSubmit={onOwnerProviderSubmit}
      />

      {/* Pending Providers Review Section */}
      <div>
        <h3 
          className="text-sm font-bold mb-3" 
          style={{ color: "var(--text-primary, white)" }}
        >
          Pending Provider Approvals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pendingProviders.length === 0 && (
            <div
              className="sm:col-span-2 rounded-xl p-5 text-sm text-center"
              style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc" }}
            >
              No providers are waiting for review.
            </div>
          )}
          
          {pendingProviders.map(({ user, provider }) => (
            <div
              key={provider.id}
              className="rounded-xl p-4"
              style={{
                background: "var(--bg-secondary, #132333)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div
                    className="font-bold truncate text-sm sm:text-base"
                    style={{ color: "var(--text-primary, white)" }}
                  >
                    {provider.business_name || provider.display_name || "Provider"}
                  </div>
                  <div className="text-xs mt-0.5 truncate" style={{ color: "#8ca5bc" }}>
                    Owner: {user.profile?.full_name || user.email}
                  </div>
                  {provider.physical_address && (
                    <div className="text-xs mt-1 break-words" style={{ color: "#cde0f0" }}>
                     {provider.physical_address}
                    </div>
                  )}
                  {provider.business_license && (
                    <div className="text-xs mt-1 break-words" style={{ color: "#cde0f0" }}>
                      License: {provider.business_license}
                    </div>
                  )}
                </div>
                <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300">
                  pending
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onSetProviderStatus(user.id, provider.id, "approved")}
                  disabled={actionLoading[`provider:${provider.id}:approved`]}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                  style={{ background: "#10b981", color: "#052e1d" }}
                >
                  {actionLoading[`provider:${provider.id}:approved`] ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => onSetProviderStatus(user.id, provider.id, "rejected")}
                  disabled={actionLoading[`provider:${provider.id}:rejected`]}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                  style={{ background: "rgba(239,68,68,0.14)", color: "#fca5a5" }}
                >
                  {actionLoading[`provider:${provider.id}:rejected`] ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Reject"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Provider Workspace for Existing Users */}
      {canManageRoles && providerTypes.length > 0 && (
        <div
          className="rounded-xl p-4 mt-4"
          style={{
            background: "var(--bg-secondary, #132333)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h3 
            className="text-sm font-bold mb-3" 
            style={{ color: "var(--text-primary, white)" }}
          >
            Add Provider Workspace to Existing User
          </h3>
          <p className="text-xs mb-3" style={{ color: "#8ca5bc" }}>
            Select a user and provider type to add a new provider workspace.
          </p>
          
          <div className="text-xs italic" style={{ color: "#8ca5bc" }}>
             Tip: Go to the Users tab to add provider workspaces to specific users
          </div>
        </div>
      )}
    </div>
  );
}