import React from "react";
import { Loader2 } from "lucide-react";
import { ManagedUser } from "@/services/admin.service";
import { ProviderTypeOption } from "@/services/provider.service";
import { AdminProviderCreatePayload } from "@/types";
import { OwnerProviderForm } from "../components/OwnerProviderForm";
import { inputStyle } from "@/constants";

interface UsersSectionProps {
  customerUsers: ManagedUser[];
  providerTypes: ProviderTypeOption[];
  providerForms: Record<string, AdminProviderCreatePayload>;
  actionLoading: Record<string, boolean>;
  color: string;
  canManageRoles: boolean;
  onUpdateProviderForm: (userId: string, patch: Partial<AdminProviderCreatePayload>) => void;
  onCreateProviderWorkspace: (userId: string) => Promise<void>;
  onSetUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  onSelectUser: (user: ManagedUser) => void;
}

export function UsersSection({
  customerUsers,
  providerTypes,
  providerForms,
  actionLoading,
  color,
  canManageRoles,
  onUpdateProviderForm,
  onCreateProviderWorkspace,
  onSetUserStatus,
  onSelectUser,
}: UsersSectionProps) {
  const UserRow = ({ managedUser }: { managedUser: ManagedUser }) => (
    <div
      onClick={() => onSelectUser(managedUser)}
      className="p-3 sm:p-4 border-b border-white/5 last:border-b-0 cursor-pointer hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate text-sm sm:text-base" style={{ color: "var(--text-primary, white)" }}>
            {managedUser.profile?.full_name || managedUser.email}
          </div>
          <div className="text-xs mt-0.5 truncate" style={{ color: "#8ca5bc" }}>
            {managedUser.email}
            {managedUser.phone && <> · {managedUser.phone}</>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {managedUser.roles.map((role) => (
              <span
                key={role}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${color}18`, color }}
              >
                {role}
              </span>
            ))}
            {!managedUser.is_verified && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300">
                unverified
              </span>
            )}
            {!managedUser.is_active && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">
                suspended
              </span>
            )}
            {managedUser.must_change_password && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
              >
                temp password
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onSetUserStatus(managedUser.id, !managedUser.is_active); }}
          disabled={actionLoading[`user:${managedUser.id}`]}
          className="self-start sm:self-auto flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
          style={
            managedUser.is_active
              ? { background: "rgba(239,68,68,0.12)", color: "#fca5a5" }
              : { background: "rgba(16,185,129,0.12)", color: "#86efac" }
          }
        >
          {actionLoading[`user:${managedUser.id}`] ? (
            <Loader2 size={12} className="animate-spin" />
          ) : managedUser.is_active ? (
            <span>Suspend</span>
          ) : (
            <span>Reactivate</span>
          )}
        </button>
      </div>

      {canManageRoles && providerTypes.length > 0 && (
        <div
          className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={providerForms[managedUser.id]?.provider_type_name ?? providerTypes[0]?.name ?? ""}
            onChange={(e) => onUpdateProviderForm(managedUser.id, { provider_type_name: e.target.value })}
            className="flex-1 rounded-lg px-2 py-2 text-xs outline-none"
            style={inputStyle}
          >
            {providerTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.display_name}
              </option>
            ))}
          </select>
          <button
            onClick={() => onCreateProviderWorkspace(managedUser.id)}
            disabled={actionLoading[`workspace:${managedUser.id}`]}
            className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold"
            style={{ background: `${color}18`, color }}
          >
            {actionLoading[`workspace:${managedUser.id}`] && (
              <Loader2 size={12} className="animate-spin" />
            )}
            Add Provider
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <OwnerProviderForm
        providerTypes={providerTypes}
        formData={{} as any}
        loading={false}
        color={color}
        onChange={() => {}}
        onSubmit={async () => {}}
      />
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-secondary, #132333)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {customerUsers.map((u) => (
          <UserRow key={u.id} managedUser={u} />
        ))}
        {customerUsers.length === 0 && (
          <div className="p-5 text-sm" style={{ color: "#8ca5bc" }}>
            No customer users found.
          </div>
        )}
      </div>
    </div>
  );
}