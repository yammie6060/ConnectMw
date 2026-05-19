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

type AdminTab = "overview" | "users" | "staff" | "providers" | "support" | "payments" | "reviews";

interface AdminManagementPageProps {
  color: string;
  initialTab?: AdminTab;
  canManageRoles: boolean;
}

// Password is gone — the system generates it automatically.
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

export function AdminManagementPage({
  color,
  initialTab = "overview",
  canManageRoles,
}: AdminManagementPageProps) {
  const [tab, setTab]           = useState<AdminTab>(initialTab);
  const [overview, setOverview] = useState<ManagementOverview | null>(null);
  const [users, setUsers]       = useState<ManagedUser[]>([]);
  const [staff, setStaff]       = useState<ManagedUser[]>([]);
  const [payments, setPayments] = useState<ManagedPayment[]>([]);
  const [tickets, setTickets]   = useState<SupportTicket[]>([]);
  const [reviews, setReviews]   = useState<ManagedReview[]>([]);
  const [staffForm, setStaffForm] = useState<StaffCreatePayload>(EMPTY_STAFF_FORM);
  const [providerTypes, setProviderTypes] = useState<ProviderTypeOption[]>([]);
  const [providerForms, setProviderForms] = useState<Record<string, AdminProviderCreatePayload>>({});
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState("");
  const [isError, setIsError]   = useState(false);

  const customerUsers = useMemo(
    () => users.filter((u) => !u.roles.some((r) => ["admin", "support"].includes(r))),
    [users],
  );

  const pendingProviders = useMemo(
    () =>
      users
        .flatMap((u) => u.providers.map((p) => ({ user: u, provider: p })))
        .filter(({ provider }) => provider.verification_status === "pending"),
    [users],
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
      const types = providerTypesRes.data ?? [];
      setProviderTypes(types);

      if (canManageRoles) {
        const staffRes = await adminService.listStaff();
        setStaff(staffRes.data?.items ?? []);
      } else {
        setStaff([]);
      }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Could not load management data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadManagementData(); }, [canManageRoles]);
  useEffect(() => { setTab(initialTab); }, [initialTab]);

  async function setUserStatus(userId: string, isActive: boolean) {
    try {
      await adminService.setUserStatus(userId, isActive);
      setIsError(false);
      setMessage(isActive ? "User reactivated." : "User suspended.");
      await loadManagementData();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Action failed.");
    }
  }

  async function setProviderStatus(userId: string, providerId: string, status: "approved" | "rejected") {
    try {
      await adminService.reviewProvider(userId, providerId, status);
      setIsError(false);
      setMessage(status === "approved" ? "Provider approved." : "Provider rejected.");
      await loadManagementData();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Action failed.");
    }
  }

  async function createStaff(event: React.FormEvent) {
    event.preventDefault();
    try {
      const res = await adminService.createStaff(staffForm);
      setStaffForm(EMPTY_STAFF_FORM);
      setIsError(false);
      // Surface the backend message which tells the admin whether the email was delivered.
      setMessage(res.message ?? "Staff account created.");
      await loadManagementData();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Could not create staff account.");
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
    }
  }

  function updateProviderForm(userId: string, patch: Partial<AdminProviderCreatePayload>) {
    setProviderForms((prev) => ({
      ...prev,
      [userId]: {
        ...EMPTY_PROVIDER_FORM,
        ...(prev[userId] ?? {}),
        provider_type_name: prev[userId]?.provider_type_name ?? providerTypes[0]?.name ?? "",
        ...patch,
      },
    }));
  }

  async function updateTicket(ticketId: string, status: string) {
    try {
      await adminService.updateSupportTicket(ticketId, status);
      setIsError(false);
      setMessage("Support ticket updated.");
      await loadManagementData();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Action failed.");
    }
  }

  // ------------------------------------------------------------------
  // Sub-components
  // ------------------------------------------------------------------

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
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-secondary, #132333)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div
            className="text-[11px] uppercase tracking-widest font-bold"
            style={{ color: "var(--text-secondary, #8ca5bc)" }}
          >
            {label}
          </div>
          <div
            className="text-2xl font-black mt-1"
            style={{ color: "var(--text-primary, white)" }}
          >
            {value}
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18`, color }}
        >
          <Icon size={18} />
        </div>
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
    <div className="p-4 border-b border-white/5 last:border-b-0">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div
            className="font-bold truncate"
            style={{ color: "var(--text-primary, white)" }}
          >
            {managedUser.profile?.full_name || managedUser.email}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--text-secondary, #8ca5bc)" }}
          >
            {managedUser.email} | {managedUser.phone}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {managedUser.roles.map((role) => (
              <span
                key={role}
                className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: `${color}18`, color }}
              >
                {role}
              </span>
            ))}
            {!managedUser.is_verified && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-300">
                email unverified
              </span>
            )}
            {!managedUser.is_active && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/15 text-red-300">
                suspended
              </span>
            )}
            {managedUser.must_change_password && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
                title="This staff member has not yet changed their temporary password"
              >
                <AlertTriangle size={10} />
                temp password
              </span>
            )}
          </div>
        </div>

        {!staffRow && (
          <div className="flex flex-col gap-2 min-w-[240px]">
            <div
              className="text-xs"
              style={{ color: "var(--text-secondary, #8ca5bc)" }}
            >
              {managedUser.providers.length} provider workspace(s)
            </div>
            {canManageRoles && providerTypes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                <select
                  value={providerForms[managedUser.id]?.provider_type_name ?? providerTypes[0]?.name ?? ""}
                  onChange={(e) => updateProviderForm(managedUser.id, { provider_type_name: e.target.value })}
                  className="rounded-lg px-2 py-2 text-xs outline-none"
                  style={{
                    background: "var(--bg-elevated, #1a2e42)",
                    color: "var(--text-primary, white)",
                    border: "1px solid var(--border-color, rgba(255,255,255,0.07))",
                  }}
                >
                  {providerTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.display_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => createProviderWorkspace(managedUser.id)}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
                  style={{ background: `${color}18`, color }}
                >
                  Add Provider
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setUserStatus(managedUser.id, !managedUser.is_active)}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
          style={
            managedUser.is_active
              ? { background: "rgba(239,68,68,0.14)", color: "#fca5a5" }
              : { background: "rgba(16,185,129,0.14)", color: "#86efac" }
          }
        >
          {managedUser.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
          {managedUser.is_active ? "Suspend" : "Reactivate"}
        </button>
      </div>
    </div>
  );

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <PageShell
      title="ConnectMW Management"
      subtitle="User support, provider verification, staff, payments, and platform trust controls"
      color={color}
    >
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          ["overview",  "Overview"],
          ["users",     "Users"],
          ...(canManageRoles ? [["staff", "Staff"]] : []),
          ["providers", "Provider Review"],
          ["support",   "Support"],
          ["payments",  "Payments"],
          ["reviews",   "Reviews"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as AdminTab)}
            className="px-3 py-2 rounded-lg text-xs font-bold"
            style={
              tab === id
                ? { background: color, color: "#0d1f2d" }
                : {
                    background: "var(--bg-muted, rgba(255,255,255,0.05))",
                    color: "var(--text-secondary, #8ca5bc)",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Feedback banner */}
      {message && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-sm"
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
          style={{
            background: "var(--bg-secondary, #132333)",
            color: "var(--text-secondary, #8ca5bc)",
          }}
        >
          Loading management data…
        </div>
      ) : (
        <>
          {/* ---- Overview ---- */}
          {tab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Stat label="Total Users"       value={overview?.users.total        ?? 0} icon={Users}      />
              <Stat label="Suspended Users"   value={overview?.users.suspended    ?? 0} icon={UserX}      />
              <Stat label="Pending Providers" value={overview?.providers.pending  ?? 0} icon={ShieldCheck} />
              <Stat label="Open Support"      value={overview?.support.open       ?? 0} icon={UserPlus}   />
              <Stat label="Payments"          value={overview?.payments.total     ?? 0} icon={CreditCard} />
            </div>
          )}

          {/* ---- Users ---- */}
          {tab === "users" && (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--bg-secondary, #132333)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {customerUsers.map((u) => <UserRow key={u.id} managedUser={u} />)}
              {customerUsers.length === 0 && (
                <div className="p-5 text-sm" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                  No customer users found.
                </div>
              )}
            </div>
          )}

          {/* ---- Staff ---- */}
          {tab === "staff" && canManageRoles && (
            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
              {/* Create form — no password field */}
              <form
                onSubmit={createStaff}
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "var(--bg-secondary, #132333)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="font-bold" style={{ color: "var(--text-primary, white)" }}>
                  Add Staff Account
                </div>

                <p className="text-xs" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                  A secure temporary password will be generated automatically and emailed to the
                  new staff member. They will be required to change it on first login.
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
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: "var(--bg-elevated, #1a2e42)",
                      color: "var(--text-primary, white)",
                      border: "1px solid var(--border-color, rgba(255,255,255,0.07))",
                    }}
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
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--bg-elevated, #1a2e42)",
                    color: "var(--text-primary, white)",
                    border: "1px solid var(--border-color, rgba(255,255,255,0.07))",
                  }}
                >
                  <option value="support">Support</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold"
                  style={{ background: color, color: "#0d1f2d" }}
                >
                  <UserPlus size={15} /> Create Staff &amp; Send Credentials
                </button>
              </form>

              {/* Staff list */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--bg-secondary, #132333)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {staff.map((u) => <UserRow key={u.id} managedUser={u} staffRow />)}
                {staff.length === 0 && (
                  <div className="p-5 text-sm" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                    No staff accounts found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- Provider Review ---- */}
          {tab === "providers" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingProviders.length === 0 && (
                <div
                  className="rounded-xl p-5 text-sm"
                  style={{
                    background: "var(--bg-secondary, #132333)",
                    color: "var(--text-secondary, #8ca5bc)",
                  }}
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
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold" style={{ color: "var(--text-primary, white)" }}>
                        {provider.business_name || provider.display_name || "Provider"}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                        {provider.display_name} | {user.profile?.full_name || user.email}
                      </div>
                      <div className="text-xs mt-2" style={{ color: "#cde0f0" }}>
                        {provider.physical_address || "No address provided"}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-300">
                      pending
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setProviderStatus(user.id, provider.id, "approved")}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
                      style={{ background: "#10b981", color: "#052e1d" }}
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => setProviderStatus(user.id, provider.id, "rejected")}
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-bold"
                      style={{ background: "rgba(239,68,68,0.14)", color: "#fca5a5" }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---- Support ---- */}
          {tab === "support" && (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--bg-secondary, #132333)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 border-b border-white/5 last:border-b-0">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold" style={{ color: "var(--text-primary, white)" }}>
                        {ticket.subject}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                        {ticket.category} | {ticket.user?.email || "No user"} | {ticket.priority}
                      </div>
                      <p className="text-sm mt-2" style={{ color: "#cde0f0" }}>
                        {ticket.message}
                      </p>
                    </div>
                    <select
                      value={ticket.status}
                      onChange={(e) => updateTicket(ticket.id, e.target.value)}
                      className="rounded-lg px-3 py-2 text-xs outline-none"
                      style={{
                        background: "var(--bg-elevated, #1a2e42)",
                        color: "var(--text-primary, white)",
                        border: "1px solid var(--border-color, rgba(255,255,255,0.07))",
                      }}
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
                <div className="p-5 text-sm" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                  No support tickets found.
                </div>
              )}
            </div>
          )}

          {/* ---- Payments ---- */}
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
                  className="p-4 border-b border-white/5 last:border-b-0 flex flex-col lg:flex-row lg:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold" style={{ color: "var(--text-primary, white)" }}>
                      {payment.payment_type}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                      {payment.user?.email || "No user"} |{" "}
                      {payment.transaction_reference || "No reference"}
                    </div>
                  </div>
                  <div className="text-sm font-black" style={{ color }}>
                    {payment.currency} {payment.amount.toLocaleString()}
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: `${color}18`, color }}
                  >
                    {payment.status}
                  </span>
                </div>
              ))}
              {payments.length === 0 && (
                <div className="p-5 text-sm" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                  No payments found.
                </div>
              )}
            </div>
          )}

          {/* ---- Reviews ---- */}
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
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-bold" style={{ color: "var(--text-primary, white)" }}>
                      {review.provider.business_name || review.provider.display_name || "Provider"}
                    </div>
                    <div className="flex gap-0.5">
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
                  <p className="text-sm mt-2" style={{ color: "#cde0f0" }}>
                    {review.comment || "No comment provided."}
                  </p>
                  <div className="text-xs mt-2" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                    {review.reviewer.email}
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div
                  className="rounded-xl p-5 text-sm"
                  style={{
                    background: "var(--bg-secondary, #132333)",
                    color: "var(--text-secondary, #8ca5bc)",
                  }}
                >
                  No reviews found.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
