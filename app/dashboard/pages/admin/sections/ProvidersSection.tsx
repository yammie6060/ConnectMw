import React, { useMemo, useState } from "react";
import { Check, Loader2, Plus, Search, Grid, List } from "lucide-react";
import {
  UserWithProvider,
  AdminProviderCreatePayload,
  OwnerProviderFormData,
  OwnerProviderFormUpdateHandler,
  ProviderFormUpdateHandler,
} from "@/types";
import { ProviderTypeOption } from "@/services/provider.service";
import { OwnerProviderForm } from "../components/OwnerProviderForm";
import { Modal } from "../components/Modal";

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
  const [search, setSearch] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const focusRingStyle = { "--tw-ring-color": color } as React.CSSProperties;

  const filteredProviders = useMemo(() => {
    if (!search) return pendingProviders;
    const q = search.toLowerCase();
    return pendingProviders.filter(
      ({ user, provider }) =>
        provider.business_name?.toLowerCase().includes(q) ||
        provider.display_name?.toLowerCase().includes(q) ||
        user.profile?.full_name?.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
    );
  }, [pendingProviders, search]);

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    await onOwnerProviderSubmit(e);
    setShowRegisterModal(false);
  };

  const ProviderCard = ({ user, provider }: UserWithProvider) => (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-secondary, #132333)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate text-sm sm:text-base" style={{ color: "var(--text-primary, white)" }}>
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
  );

  const ProviderListRow = ({ user, provider }: UserWithProvider) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border-b border-white/5 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold truncate text-sm" style={{ color: "var(--text-primary, white)" }}>
            {provider.business_name || provider.display_name || "Provider"}
          </span>
          <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300">
            pending
          </span>
        </div>
        <div className="text-xs mt-0.5 truncate" style={{ color: "#8ca5bc" }}>
          Owner: {user.profile?.full_name || user.email}
          {provider.physical_address && <> · {provider.physical_address}</>}
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onSetProviderStatus(user.id, provider.id, "approved")}
          disabled={actionLoading[`provider:${provider.id}:approved`]}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
          style={{ background: "#10b981", color: "#052e1d" }}
        >
          {actionLoading[`provider:${provider.id}:approved`] ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Check size={12} />
          )}
          Approve
        </button>
        <button
          onClick={() => onSetProviderStatus(user.id, provider.id, "rejected")}
          disabled={actionLoading[`provider:${provider.id}:rejected`]}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
          style={{ background: "rgba(239,68,68,0.14)", color: "#fca5a5" }}
        >
          {actionLoading[`provider:${provider.id}:rejected`] ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            "Reject"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="text-xl sm:text-2xl font-bold" style={{ color }}>
            {pendingProviders.length}
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>
            Pending Approvals
          </div>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="text-xl sm:text-2xl font-bold" style={{ color: "#10b981" }}>
            {pendingProviders.filter((p) => p.provider.status === "approved").length}
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>
            Approved
          </div>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="text-xl sm:text-2xl font-bold" style={{ color: "#f5ab20" }}>
            {pendingProviders.filter((p) => p.provider.status === "pending").length}
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>
            Pending
          </div>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="text-xl sm:text-2xl font-bold" style={{ color: "#8ca5bc" }}>
            {providerTypes.length}
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>
            Provider Types
          </div>
        </div>
      </div>

      {/* Search & Register Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div
          className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all focus-within:ring-2"
          style={{
            background: "var(--bg-secondary, #132333)",
            border: "1px solid rgba(255,255,255,0.07)",
            ...focusRingStyle,
          }}
        >
          <Search size={16} style={{ color: "#8ca5bc", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search providers by name or owner..."
            className="flex-1 bg-transparent text-sm outline-none min-w-0"
            style={{ color: "var(--text-primary, white)" }}
          />
        </div>
        <div className="flex rounded-lg overflow-hidden flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={() => setViewMode("list")}
            className="p-2.5 transition-colors"
            style={{ background: viewMode === "list" ? "var(--bg-elevated, #1a2e42)" : "transparent" }}
          >
            <List size={15} style={{ color: viewMode === "list" ? color : "#8ca5bc" }} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className="p-2.5 transition-colors"
            style={{ background: viewMode === "grid" ? "var(--bg-elevated, #1a2e42)" : "transparent" }}
          >
            <Grid size={15} style={{ color: viewMode === "grid" ? color : "#8ca5bc" }} />
          </button>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 sm:px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all hover:brightness-110 active:scale-95 whitespace-nowrap"
          style={{ background: color, color: "#0d1f2d" }}
        >
          <Plus size={16} />
          <span className="hidden xs:inline">Register Provider</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>

      {/* Pending Providers Review Section */}
      <div>
        <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary, white)" }}>
          Pending Provider Approvals
        </h3>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProviders.length === 0 && (
              <div
                className="sm:col-span-2 rounded-xl p-5 text-sm text-center"
                style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc" }}
              >
                {search ? "No providers match your search." : "No providers are waiting for review."}
              </div>
            )}
            {filteredProviders.map((entry) => (
              <ProviderCard key={entry.provider.id} user={entry.user} provider={entry.provider} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {filteredProviders.length === 0 && (
              <div className="p-5 text-sm" style={{ color: "#8ca5bc" }}>
                {search ? "No providers match your search." : "No providers are waiting for review."}
              </div>
            )}
            {filteredProviders.map((entry) => (
              <ProviderListRow key={entry.provider.id} user={entry.user} provider={entry.provider} />
            ))}
          </div>
        )}
      </div>

      {/* Add Provider Workspace tip for existing users */}
      {canManageRoles && providerTypes.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-secondary, #132333)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary, white)" }}>
            Add Provider Workspace to Existing User
          </h3>
          <p className="text-xs" style={{ color: "#8ca5bc" }}>
            Go to the Users tab and use the add-provider action on a user's row to add a provider workspace to
            their account.
          </p>
        </div>
      )}

      {/* Register Provider Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register New Provider"
        subtitle="Create a provider workspace on behalf of a business owner."
        maxWidth="max-w-2xl"
      >
        <OwnerProviderForm
          providerTypes={providerTypes}
          formData={ownerProviderForm}
          loading={!!actionLoading["owner-provider:create"]}
          color={color}
          onChange={onOwnerProviderFormChange}
          onSubmit={handleOwnerSubmit}
        />
      </Modal>
    </div>
  );
}