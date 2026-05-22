import React from "react";
import { Loader2, UserPlus } from "lucide-react";
import { ManagedUser } from "@/services/admin.service";
import { StaffCreatePayload } from "@/types";
import { inputStyle } from "@/constants";

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
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <form
        onSubmit={onCreateStaff}
        className="w-full lg:w-80 flex-shrink-0 rounded-xl p-4 space-y-3"
        style={{
          background: "var(--bg-secondary, #132333)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="font-bold text-sm" style={{ color: "var(--text-primary, white)" }}>
          Add Staff Account
        </div>
        <p className="text-xs" style={{ color: "#8ca5bc" }}>
          A secure temporary password is generated automatically and emailed to the new
          staff member. They must change it on first login.
        </p>

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

        <button
          disabled={actionLoading["staff:create"]}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold"
          style={{ background: color, color: "#0d1f2d" }}
        >
          {actionLoading["staff:create"] ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <UserPlus size={14} />
          )}
          {actionLoading["staff:create"] ? "Creating..." : "Create Staff & Send Credentials"}
        </button>
      </form>

      <div
        className="flex-1 rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-secondary, #132333)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {staff.map((u) => (
          <StaffRow key={u.id} managedUser={u} />
        ))}
        {staff.length === 0 && (
          <div className="p-5 text-sm" style={{ color: "#8ca5bc" }}>
            No staff accounts found.
          </div>
        )}
      </div>
    </div>
  );
}