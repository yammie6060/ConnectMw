import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CreditCard,
  ShieldCheck,
  Star,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  AlertTriangle,
  Loader2,
  X,
  Mail,
  Phone,
  Building2,
  ChevronDown,
} from "lucide-react";
import { PageShell } from "../components/PageShell";
import {
  AdminProviderCreatePayload,
  adminService,
  ManagedPayment,
  ManagedReview,
  ManagedUser,
  ManagementOverview,
  StaffCreatePayload,
  SupportTicket,
} from "@/services/admin.service";
import { providerService, ProviderTypeOption } from "@/services/provider.service";

type AdminTab =
  | "overview"
  | "users"
  | "staff"
  | "providers"
  | "support"
  | "payments"
  | "reviews";

interface AdminManagementPageProps {
  color: string;
  initialTab?: AdminTab;
  canManageRoles: boolean;
}

const EMPTY_STAFF_FORM: StaffCreatePayload = {
  full_name: "",
  email: "",
  phone: "",
  role: "support",
};

const EMPTY_PROVIDER_FORM: AdminProviderCreatePayload = {
  provider_type_name: "",
  business_name: "",
  business_license: "",
  physical_address: "",
};

// Shared input style used in forms
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated, #1a2e42)",
  color: "var(--text-primary, white)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "8px",
  padding: "9px 12px",
  fontSize: "13px",
  outline: "none",
};

export function AdminManagementPage({
  color,
  initialTab = "overview",
  canManageRoles,
}: AdminManagementPageProps) {
  const [tab, setTab] = useState<AdminTab>(initialTab);
  const [overview, setOverview] = useState<ManagementOverview | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [staff, setStaff] = useState<ManagedUser[]>([]);
  const [payments, setPayments] = useState<ManagedPayment[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [reviews, setReviews] = useState<ManagedReview[]>([]);
  const [staffForm, setStaffForm] = useState<StaffCreatePayload>(EMPTY_STAFF_FORM);
  const [providerTypes, setProviderTypes] = useState<ProviderTypeOption[]>([]);
  const [providerForms, setProviderForms] = useState<Record<string, AdminProviderCreatePayload>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const customerUsers = useMemo(
    () => users.filter((u) => !u.roles.some((r) => ["admin", "support"].includes(r))),
    [users]
  );

  const pendingProviders = useMemo(
    () =>
      users
        .flatMap((u) => u.providers.map((p) => ({ user: u, provider: p })))
        .filter(({ provider }) => provider.verification_status === "pending"),
    [users]
  );

  async function loadManagementData() {
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const [overviewRes, usersRes, reviewsRes, paymentsRes, ticketsRes] = await Promise.all([
        adminService.getOverview(),
        adminService.listUsers(),
        adminService.listReviews(),
        adminService.listPayments(),
        adminService.listSupportTickets(),
      ] as const);
      setOverview(overviewRes.data ?? null);
      setUsers(usersRes.data?.items ?? []);
      setReviews(reviewsRes.data?.items ?? []);
      setPayments(paymentsRes.data?.items ?? []);
      setTickets(ticketsRes.data?.items ?? []);

      const providerTypesRes = await providerService.getProviderTypes();
      setProviderTypes(providerTypesRes.data ?? []);

      if (canManageRoles) {
        const staffRes = await adminService.listStaff();
        setStaff(staffRes.data?.items ?? []);
      } else {
        setStaff([]);
      }
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "Could not load management data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadManagementData(); }, [canManageRoles]);
  useEffect(() => { setTab(initialTab); }, [initialTab]);

  async function setUserStatus(userId: string, isActive: boolean) {
    const key = `user:${userId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await adminService.setUserStatus(userId, isActive);
      setIsError(false);
      setMessage(isActive ? "User reactivated." : "User suspended.");
      await loadManagementData();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function setProviderStatus(
    userId: string,
    providerId: string,
    status: "approved" | "rejected"
  ) {
    const key = `provider:${providerId}:${status}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await adminService.reviewProvider(userId, providerId, status);
      setIsError(false);
      setMessage(status === "approved" ? "Provider approved." : "Provider rejected.");
      await loadManagementData();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function createStaff(event: React.FormEvent) {
    event.preventDefault();
    setActionLoading((prev) => ({ ...prev, "staff:create": true }));
    try {
      const res = await adminService.createStaff(staffForm);
      setStaffForm(EMPTY_STAFF_FORM);
      setIsError(false);
      setMessage(res.message ?? "Staff account created.");
      await loadManagementData();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Could not create staff account.");
    } finally {
      setActionLoading((prev) => ({ ...prev, "staff:create": false }));
    }
  }

  async function createProviderWorkspace(userId: string) {
    const form = providerForms[userId] ?? {
      ...EMPTY_PROVIDER_FORM,
      provider_type_name: providerTypes[0]?.name ?? "",
    };
    if (!form.provider_type_name) {
      setIsError(true);
      setMessage("Choose a provider type first.");
      return;
    }
    const key = `workspace:${userId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await adminService.createProvider(userId, {
        provider_type_name: form.provider_type_name,
        business_name: form.business_name?.trim() || undefined,
        business_license: form.business_license?.trim() || undefined,
        physical_address: form.physical_address?.trim() || undefined,
      });
      setProviderForms((prev) => ({ ...prev, [userId]: { ...EMPTY_PROVIDER_FORM } }));
      setIsError(false);
      setMessage("Provider workspace created.");
      await loadManagementData();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Could not create provider workspace.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  function updateProviderForm(userId: string, patch: Partial<AdminProviderCreatePayload>) {
    setProviderForms((prev) => ({
      ...prev,
      [userId]: {
        ...EMPTY_PROVIDER_FORM,
        ...(prev[userId] ?? {}),
        provider_type_name:
          prev[userId]?.provider_type_name ?? providerTypes[0]?.name ?? "",
        ...patch,
      },
    }));
  }

  async function updateTicket(ticketId: string, status: string) {
    const key = `ticket:${ticketId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await adminService.updateSupportTicket(ticketId, status);
      setIsError(false);
      setMessage("Support ticket updated.");
      await loadManagementData();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  // ── Sub-components ───────────────────────────────────────────────

  const Stat = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: number | string;
    icon: React.ElementType;
  }) => (
    <div
      className="rounded-xl p-3 sm:p-4"
      style={{
        background: "var(--bg-secondary, #132333)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div
            className="text-[10px] uppercase tracking-widest font-bold"
            style={{ color: "#8ca5bc" }}
          >
            {label}
          </div>
          <div className="text-xl sm:text-2xl font-black mt-1" style={{ color: "var(--text-primary, white)" }}>
            {value}
          </div>
        </div>
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, color }}
        >
          <Icon size={16} className="sm:w-[17px] sm:h-[17px]" />
        </div>
      </div>
    </div>
  );

  const Bar = ({
    label,
    value,
    total,
    tone = color,
  }: {
    label: string;
    value: number;
    total: number;
    tone?: string;
  }) => (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "#8ca5bc" }}>
        <span>{label}</span>
        <span className="font-bold" style={{ color: "var(--text-primary, white)" }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${total ? Math.max(4, Math.round((value / total) * 100)) : 0}%`,
            background: tone,
          }}
        />
      </div>
    </div>
  );

  const UserRow = ({
    managedUser,
    staffRow = false,
  }: {
    managedUser: ManagedUser;
    staffRow?: boolean;
  }) => (
    <div
      onClick={() => setSelectedUser(managedUser)}
      className="p-3 sm:p-4 border-b border-white/5 last:border-b-0 cursor-pointer hover:bg-white/[0.02] transition-colors"
    >
      {/* Top row: name + suspend button */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate text-sm sm:text-base" style={{ color: "var(--text-primary, white)" }}>
            {managedUser.profile?.full_name || managedUser.email}
          </div>
          <div className="text-xs mt-0.5 truncate" style={{ color: "#8ca5bc" }}>
            {managedUser.email}
            {managedUser.phone && <> · {managedUser.phone}</>}
          </div>
          {/* Role badges */}
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
                <AlertTriangle size={9} /> temp password
              </span>
            )}
          </div>
        </div>

        {/* Suspend/reactivate */}
        <button
          onClick={(e) => { e.stopPropagation(); setUserStatus(managedUser.id, !managedUser.is_active); }}
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
            <UserX size={12} />
          ) : (
            <UserCheck size={12} />
          )}
          <span className="hidden sm:inline">
            {managedUser.is_active ? "Suspend" : "Reactivate"}
          </span>
        </button>
      </div>

      {/* Add provider workspace (non-staff rows only) */}
      {!staffRow && canManageRoles && providerTypes.length > 0 && (
        <div
          className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={
              providerForms[managedUser.id]?.provider_type_name ??
              providerTypes[0]?.name ??
              ""
            }
            onChange={(e) =>
              updateProviderForm(managedUser.id, { provider_type_name: e.target.value })
            }
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
            onClick={() => createProviderWorkspace(managedUser.id)}
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

  const UserDetail = ({ managedUser }: { managedUser: ManagedUser }) => (
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
        {/* Header */}
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
              {managedUser.profile?.full_name || managedUser.email}
            </h3>
            <p className="text-xs" style={{ color: "#8ca5bc" }}>
              User details and provider workspaces
            </p>
          </div>
          <button
            onClick={() => setSelectedUser(null)}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Contact - responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              className="rounded-xl p-3 flex items-center gap-2"
              style={{ background: "var(--bg-elevated, #1a2e42)" }}
            >
              <Mail size={13} style={{ color, flexShrink: 0 }} />
              <span
                className="text-xs break-all"
                style={{ color: "#cde0f0" }}
              >
                {managedUser.email}
              </span>
            </div>
            <div
              className="rounded-xl p-3 flex items-center gap-2"
              style={{ background: "var(--bg-elevated, #1a2e42)" }}
            >
              <Phone size={13} style={{ color, flexShrink: 0 }} />
              <span className="text-xs" style={{ color: "#cde0f0" }}>
                {managedUser.phone || "Not set"}
              </span>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-1.5">
            {managedUser.roles.map((role) => (
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
                managedUser.is_active
                  ? { background: "#10b98120", color: "#10b981" }
                  : { background: "#ef444420", color: "#ef4444" }
              }
            >
              {managedUser.is_active ? "active" : "suspended"}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={
                managedUser.is_verified
                  ? { background: "#10b98120", color: "#10b981" }
                  : { background: "#f5ab2020", color: "#f5ab20" }
              }
            >
              {managedUser.is_verified ? "verified" : "unverified"}
            </span>
          </div>

          {/* Profile fields - responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { label: "City", value: managedUser.profile?.city },
              { label: "District", value: managedUser.profile?.district },
              {
                label: "Created",
                value: managedUser.created_at
                  ? new Date(managedUser.created_at).toLocaleDateString()
                  : undefined,
              },
              {
                label: "Last login",
                value: managedUser.last_login_at
                  ? new Date(managedUser.last_login_at).toLocaleDateString()
                  : "Never",
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

          {/* Provider workspaces */}
          <div>
            <h4
              className="text-[10px] uppercase tracking-widest font-bold mb-2"
              style={{ color: "#8ca5bc" }}
            >
              Provider Workspaces
            </h4>
            <div className="space-y-2">
              {managedUser.providers.map((provider) => (
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
              {managedUser.providers.length === 0 && (
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

  // Mobile tab selector component
  const MobileTabSelector = () => {
    const currentTabLabel = TABS.find(([id]) => id === tab)?.[1] || "Overview";
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="sm:hidden mb-4 relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl"
          style={{
            background: "var(--bg-secondary, #132333)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span className="text-sm font-bold" style={{ color: "var(--text-primary, white)" }}>
            {currentTabLabel}
          </span>
          <ChevronDown size={16} style={{ color: "#8ca5bc" }} />
        </button>
        
        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
            style={{
              background: "var(--bg-secondary, #132333)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {TABS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm transition-colors border-b border-white/5 last:border-b-0"
                style={{
                  color: tab === id ? color : "#8ca5bc",
                  background: tab === id ? `${color}10` : "transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────

  const TABS: [AdminTab, string][] = [
    ["overview", "Overview"],
    ["users", "Users"],
    ...(canManageRoles ? [["staff", "Staff"] as [AdminTab, string]] : []),
    ["providers", "Providers"],
    ["support", "Support"],
    ["payments", "Payments"],
    ["reviews", "Reviews"],
  ];

  return (
    <PageShell
      title="ConnectMW Management"
      subtitle="User support, provider verification, staff, payments, and platform trust"
      color={color}
    >
      {/* Mobile tab selector */}
      <MobileTabSelector />

      {/* Desktop tab bar */}
      <div className="hidden sm:flex gap-1.5 overflow-x-auto scrollbar-none pb-1 mb-5">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all"
            style={
              tab === id
                ? { background: color, color: "#0d1f2d" }
                : {
                    background: "rgba(255,255,255,0.05)",
                    color: "#8ca5bc",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Feedback banner ── */}
      {message && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-xs font-semibold"
          style={
            isError
              ? { background: "rgba(239,68,68,0.12)", color: "#fca5a5" }
              : { background: `${color}14`, color }
          }
        >
          {message}
        </div>
      )}

      {loading ? (
        <div
          className="rounded-xl p-5 text-sm"
          style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc" }}
        >
          Loading management data…
        </div>
      ) : (
        <>
          {/* ── Overview ── */}
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                <Stat label="Total Users" value={overview?.users.total ?? 0} icon={Users} />
                <Stat label="Suspended" value={overview?.users.suspended ?? 0} icon={UserX} />
                <Stat label="Pending Prov." value={overview?.providers.pending ?? 0} icon={ShieldCheck} />
                <Stat label="Open Support" value={overview?.support.open ?? 0} icon={UserPlus} />
                <Stat label="Payments" value={overview?.payments.total ?? 0} icon={CreditCard} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* User health */}
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{
                    background: "var(--bg-secondary, #132333)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#8ca5bc" }}>
                    User Health
                  </h3>
                  <Bar label="Active" value={overview?.users.active ?? 0} total={overview?.users.total ?? 0} tone="#10b981" />
                  <Bar label="Suspended" value={overview?.users.suspended ?? 0} total={overview?.users.total ?? 0} tone="#ef4444" />
                  <Bar label="Unverified" value={overview?.users.unverified ?? 0} total={overview?.users.total ?? 0} tone="#f5ab20" />
                </div>

                {/* Provider review */}
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{
                    background: "var(--bg-secondary, #132333)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#8ca5bc" }}>
                    Provider Review
                  </h3>
                  <Bar label="Approved" value={overview?.providers.approved ?? 0} total={overview?.providers.total ?? 0} tone="#10b981" />
                  <Bar label="Pending" value={overview?.providers.pending ?? 0} total={overview?.providers.total ?? 0} tone="#f5ab20" />
                  <Bar label="Rejected" value={overview?.providers.rejected ?? 0} total={overview?.providers.total ?? 0} tone="#ef4444" />
                </div>

                {/* Recent activity */}
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--bg-secondary, #132333)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <h3 className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: "#8ca5bc" }}>
                    Recent Activity
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {[
                      ...tickets.slice(0, 3).map((t) => ({
                        label: t.subject,
                        sub: `Support · ${t.status}`,
                        tone: "#38bdf8",
                      })),
                      ...payments.slice(0, 3).map((p) => ({
                        label: p.payment_type,
                        sub: `${p.currency} ${p.amount.toLocaleString()} · ${p.status}`,
                        tone: "#10b981",
                      })),
                      ...reviews.slice(0, 3).map((r) => ({
                        label: r.provider.business_name || "Review",
                        sub: `${r.rating}/5 · ${r.reviewer.email}`,
                        tone: "#f5ab20",
                      })),
                    ]
                      .slice(0, 5)
                      .map((item, idx) => (
                        <div
                          key={`${item.label}-${item.sub}-${idx}`}
                          className="flex items-center gap-2 rounded-lg p-2"
                          style={{ background: "var(--bg-elevated, #1a2e42)" }}
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: item.tone }}
                          />
                          <div className="min-w-0">
                            <div
                              className="text-xs font-bold truncate"
                              style={{ color: "var(--text-primary, white)" }}
                            >
                              {item.label}
                            </div>
                            <div className="text-[10px] truncate" style={{ color: "#8ca5bc" }}>
                              {item.sub}
                            </div>
                          </div>
                        </div>
                      ))}
                    {tickets.length + payments.length + reviews.length === 0 && (
                      <div className="text-xs" style={{ color: "#8ca5bc" }}>
                        No recent activity.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {tab === "users" && (
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
          )}

          {/* ── Staff ── */}
          {tab === "staff" && canManageRoles && (
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Create form */}
              <form
                onSubmit={createStaff}
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
                    onChange={(e) =>
                      setStaffForm((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    style={inputStyle}
                  />
                ))}

                <select
                  value={staffForm.role}
                  onChange={(e) =>
                    setStaffForm((prev) => ({
                      ...prev,
                      role: e.target.value as "support" | "admin",
                    }))
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
                  {actionLoading["staff:create"]
                    ? "Creating..."
                    : "Create Staff & Send Credentials"}
                </button>
              </form>

              {/* Staff list */}
              <div
                className="flex-1 rounded-xl overflow-hidden"
                style={{
                  background: "var(--bg-secondary, #132333)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {staff.map((u) => (
                  <UserRow key={u.id} managedUser={u} staffRow />
                ))}
                {staff.length === 0 && (
                  <div className="p-5 text-sm" style={{ color: "#8ca5bc" }}>
                    No staff accounts found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Provider Review ── */}
          {tab === "providers" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingProviders.length === 0 && (
                <div
                  className="sm:col-span-2 rounded-xl p-5 text-sm"
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
                        {user.profile?.full_name || user.email}
                      </div>
                      {provider.physical_address && (
                        <div className="text-xs mt-1 break-words" style={{ color: "#cde0f0" }}>
                          {provider.physical_address}
                        </div>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300">
                      pending
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setProviderStatus(user.id, provider.id, "approved")}
                      disabled={actionLoading[`provider:${provider.id}:approved`]}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
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
                      onClick={() => setProviderStatus(user.id, provider.id, "rejected")}
                      disabled={actionLoading[`provider:${provider.id}:rejected`]}
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-bold"
                      style={{ background: "rgba(239,68,68,0.14)", color: "#fca5a5" }}
                    >
                      {actionLoading[`provider:${provider.id}:rejected`]
                        ? "Rejecting..."
                        : "Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Support ── */}
          {tab === "support" && (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--bg-secondary, #132333)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-3 sm:p-4 border-b border-white/5 last:border-b-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm sm:text-base" style={{ color: "var(--text-primary, white)" }}>
                        {ticket.subject}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#8ca5bc" }}>
                        {ticket.category} · {ticket.user?.email || "No user"} · {ticket.priority}
                      </div>
                      <p className="text-sm mt-2 break-words" style={{ color: "#cde0f0" }}>
                        {ticket.message}
                      </p>
                    </div>
                    <select
                      value={ticket.status}
                      onChange={(e) => updateTicket(ticket.id, e.target.value)}
                      disabled={actionLoading[`ticket:${ticket.id}`]}
                      className="w-full sm:w-auto flex-shrink-0 rounded-lg px-3 py-2 text-xs outline-none"
                      style={inputStyle}
                    >
                      <option value="open">open</option>
                      <option value="in_progress">in progress</option>
                      <option value="resolved">resolved</option>
                      <option value="closed">closed</option>
                    </select>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="p-5 text-sm" style={{ color: "#8ca5bc" }}>
                  No support tickets found.
                </div>
              )}
            </div>
          )}

          {/* ── Payments ── */}
          {tab === "payments" && (
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
                      {payment.transaction_reference && ` · ${payment.transaction_reference}`}
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
          )}

          {/* ── Reviews ── */}
          {tab === "reviews" && (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--bg-secondary, #132333)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <div
                        className="font-bold truncate text-sm sm:text-base"
                        style={{ color: "var(--text-primary, white)" }}
                      >
                        {review.provider.business_name ||
                          review.provider.display_name ||
                          "Provider"}
                      </div>
                      <div className="text-xs mt-0.5 break-words" style={{ color: "#8ca5bc" }}>
                        {review.reviewer.email}
                      </div>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          fill={star <= review.rating ? color : "transparent"}
                          style={{ color }}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm mt-2 break-words" style={{ color: "#cde0f0" }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <div
                  className="rounded-xl p-5 text-sm"
                  style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc" }}
                >
                  No reviews found.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── User detail modal ── */}
      {selectedUser && <UserDetail managedUser={selectedUser} />}
    </PageShell>
  );
}