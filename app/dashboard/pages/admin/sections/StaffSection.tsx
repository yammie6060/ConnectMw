import React, { useMemo, useState } from "react";
import { Loader2, UserPlus, Users, UserCheck, UserCog, Headphones, Search, Grid, List } from "lucide-react";
import { ManagedUser } from "@/services/admin.service";
import { StaffCreatePayload } from "@/types";
import { inputStyle } from "@/constants";
import { Modal } from "../components/Modal";

interface StaffSectionProps {
  staff: ManagedUser[];
  staffForm: StaffCreatePayload;
  actionLoading: Record<string, boolean>;
  color: string;
  onStaffFormChange: (form: StaffCreatePayload) => void;
  onCreateStaff: (e: React.FormEvent) => Promise<void>;
  onSetUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  onSelectUser: (user: ManagedUser) => void;
}

export function StaffSection({
  staff,
  staffForm,
  actionLoading,
  color,
  onStaffFormChange,
  onCreateStaff,
  onSetUserStatus,
  onSelectUser,
}: StaffSectionProps) {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const totalStaff = staff.length;
  const activeStaff = staff.filter((u) => u.is_active).length;
  const adminStaff = staff.filter((u) => u.roles.includes("admin")).length;
  const supportStaff = staff.filter((u) => u.roles.includes("support")).length;

  const focusRingStyle = { "--tw-ring-color": color } as React.CSSProperties;

  const filteredStaff = useMemo(() => {
    if (!search) return staff;
    const q = search.toLowerCase();
    return staff.filter(
      (u) =>
        u.profile?.full_name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
    );
  }, [staff, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    await onCreateStaff(e);
    setShowAddModal(false);
  };

  const StaffRow = ({ managedUser }: { managedUser: ManagedUser }) => (
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
            {!managedUser.is_active && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">
                suspended
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetUserStatus(managedUser.id, !managedUser.is_active);
          }}
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
    </div>
  );

  const StaffGridCard = ({ managedUser }: { managedUser: ManagedUser }) => (
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetUserStatus(managedUser.id, !managedUser.is_active);
          }}
          disabled={actionLoading[`user:${managedUser.id}`]}
          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex-shrink-0"
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
        {!managedUser.is_active && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">
            suspended
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
              {totalStaff}
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>
            Total Staff
          </div>
        </div>
        <div
          className="rounded-xl p-3 sm:p-4"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <UserCheck size={14} style={{ color: "#10b981" }} />
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "#10b981" }}>
              {activeStaff}
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
            <UserCog size={14} style={{ color: "#f5ab20" }} />
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "#f5ab20" }}>
              {adminStaff}
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>
            Admins
          </div>
        </div>
        <div
          className="rounded-xl p-3 sm:p-4"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Headphones size={14} style={{ color: "#8ca5bc" }} />
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "#8ca5bc" }}>
              {supportStaff}
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>
            Support
          </div>
        </div>
      </div>

      {/* Search & Add Button */}
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
            placeholder="Search staff by name, email, or phone..."
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
          onClick={() => setShowAddModal(true)}
          className="px-4 sm:px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all hover:brightness-110 active:scale-95 whitespace-nowrap"
          style={{ background: color, color: "#0d1f2d" }}
        >
          <UserPlus size={16} />
          <span className="hidden xs:inline">Add Staff Account</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>

      {/* Staff List / Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredStaff.map((u) => (
            <StaffGridCard key={u.id} managedUser={u} />
          ))}
          {filteredStaff.length === 0 && (
            <div
              className="xs:col-span-2 lg:col-span-3 rounded-xl p-5 text-sm text-center"
              style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc" }}
            >
              {search ? "No staff match your search." : "No staff accounts found."}
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {filteredStaff.map((u) => (
            <StaffRow key={u.id} managedUser={u} />
          ))}
          {filteredStaff.length === 0 && (
            <div className="p-5 text-sm" style={{ color: "#8ca5bc" }}>
              {search ? "No staff match your search." : "No staff accounts found."}
            </div>
          )}
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Staff Account"
        subtitle="A secure temporary password is generated automatically and emailed to the new staff member. They must change it on first login."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {(["full_name", "email", "phone"] as const).map((field) => (
            <input
              key={field}
              required
              type="text"
              placeholder={field.replace("_", " ")}
              value={staffForm[field]}
              onChange={(e) => onStaffFormChange({ ...staffForm, [field]: e.target.value })}
              style={inputStyle}
            />
          ))}

          <select
            value={staffForm.role}
            onChange={(e) =>
              onStaffFormChange({
                ...staffForm,
                role: e.target.value as "support" | "admin",
              })
            }
            style={inputStyle}
          >
            <option value="support">Support</option>
            <option value="admin">Admin</option>
          </select>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}
            >
              Cancel
            </button>
            <button
              disabled={actionLoading["staff:create"]}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold"
              style={{ background: color, color: "#0d1f2d" }}
            >
              {actionLoading["staff:create"] ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserPlus size={14} />
              )}
              {actionLoading["staff:create"] ? "Creating..." : "Create & Send"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}