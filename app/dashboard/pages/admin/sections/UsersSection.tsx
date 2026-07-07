import React, { useMemo, useState } from "react";
import { Loader2, Users, UserCheck, UserX, Shield, Search, UserPlus, Grid, List } from "lucide-react";
import { ManagedUser } from "@/services/admin.service";
import { ProviderTypeOption } from "@/services/provider.service";
import { AdminProviderCreatePayload } from "@/types";
import { Modal } from "../components/Modal";
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
  const [search, setSearch] = useState("");
  const [providerModalUser, setProviderModalUser] = useState<ManagedUser | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Stats
  const totalUsers = customerUsers.length;
  const activeUsers = customerUsers.filter((u) => u.is_active).length;
  const verifiedUsers = customerUsers.filter((u) => u.is_verified).length;
  const suspendedUsers = customerUsers.filter((u) => !u.is_active).length;

  const focusRingStyle = { "--tw-ring-color": color } as React.CSSProperties;

  const filteredUsers = useMemo(() => {
    if (!search) return customerUsers;
    const q = search.toLowerCase();
    return customerUsers.filter(
      (u) =>
        u.profile?.full_name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
    );
  }, [customerUsers, search]);

  const handleAddProvider = async () => {
    if (!providerModalUser) return;
    await onCreateProviderWorkspace(providerModalUser.id);
    setProviderModalUser(null);
  };

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

        <div
          className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {canManageRoles && providerTypes.length > 0 && (
            <button
              onClick={() => setProviderModalUser(managedUser)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: `${color}18` }}
              title="Add provider workspace"
            >
              <UserPlus size={13} style={{ color }} />
            </button>
          )}
          <button
            onClick={() => onSetUserStatus(managedUser.id, !managedUser.is_active)}
            disabled={actionLoading[`user:${managedUser.id}`]}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
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
      </div>
    </div>
  );

  const UserGridCard = ({ managedUser }: { managedUser: ManagedUser }) => (
    <div
      onClick={() => onSelectUser(managedUser)}
      className="group rounded-2xl p-4 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
      style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: `${color}18`, color }}
        >
          {(managedUser.profile?.full_name || managedUser.email).charAt(0).toUpperCase()}
        </div>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {canManageRoles && providerTypes.length > 0 && (
            <button
              onClick={() => setProviderModalUser(managedUser)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: `${color}18` }}
              title="Add provider workspace"
            >
              <UserPlus size={13} style={{ color }} />
            </button>
          )}
          <button
            onClick={() => onSetUserStatus(managedUser.id, !managedUser.is_active)}
            disabled={actionLoading[`user:${managedUser.id}`]}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
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
      </div>
      <div className="font-bold text-sm truncate" style={{ color: "var(--text-primary, white)" }}>
        {managedUser.profile?.full_name || managedUser.email}
      </div>
      <div className="text-xs mt-0.5 truncate" style={{ color: "#8ca5bc" }}>
        {managedUser.email}
        {managedUser.phone && <> · {managedUser.phone}</>}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
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
  );

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className="rounded-xl p-3 sm:p-4"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} style={{ color }} />
            <div className="text-xl sm:text-2xl font-bold" style={{ color }}>
              {totalUsers}
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>
            Total Users
          </div>
        </div>
        <div
          className="rounded-xl p-3 sm:p-4"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <UserCheck size={14} style={{ color: "#10b981" }} />
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "#10b981" }}>
              {activeUsers}
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>
            Active
          </div>
        </div>
        <div
          className="rounded-xl p-3 sm:p-4"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} style={{ color: "#f5ab20" }} />
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "#f5ab20" }}>
              {verifiedUsers}
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>
            Verified
          </div>
        </div>
        <div
          className="rounded-xl p-3 sm:p-4"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <UserX size={14} style={{ color: "#8ca5bc" }} />
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "#8ca5bc" }}>
              {suspendedUsers}
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>
            Suspended
          </div>
        </div>
      </div>

      {/* Search Bar & View Toggle */}
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
            placeholder="Search users by name, email, or phone..."
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
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredUsers.map((u) => (
            <UserGridCard key={u.id} managedUser={u} />
          ))}
          {filteredUsers.length === 0 && (
            <div
              className="xs:col-span-2 lg:col-span-3 rounded-xl p-5 text-sm text-center"
              style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc" }}
            >
              {search ? "No users match your search." : "No customer users found."}
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-secondary, #132333)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {filteredUsers.map((u) => (
            <UserRow key={u.id} managedUser={u} />
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-5 text-sm" style={{ color: "#8ca5bc" }}>
              {search ? "No users match your search." : "No customer users found."}
            </div>
          )}
        </div>
      )}

      {/* Add Provider Workspace Modal */}
      <Modal
        isOpen={!!providerModalUser}
        onClose={() => setProviderModalUser(null)}
        title="Add Provider Workspace"
        subtitle={
          providerModalUser
            ? `Create a provider workspace for ${providerModalUser.profile?.full_name || providerModalUser.email}`
            : undefined
        }
      >
        {providerModalUser && (
          <div className="space-y-4">
            <select
              value={providerForms[providerModalUser.id]?.provider_type_name ?? providerTypes[0]?.name ?? ""}
              onChange={(e) => onUpdateProviderForm(providerModalUser.id, { provider_type_name: e.target.value })}
              style={inputStyle}
            >
              {providerTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.display_name}
                </option>
              ))}
            </select>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProviderModalUser(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddProvider}
                disabled={actionLoading[`workspace:${providerModalUser.id}`]}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold"
                style={{ background: color, color: "#0d1f2d" }}
              >
                {actionLoading[`workspace:${providerModalUser.id}`] && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Add Provider
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}