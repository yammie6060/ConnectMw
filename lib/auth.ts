// lib/auth.ts

const ACCESS_TOKEN_KEY = "connectmw_access_token";
const AUTH_USER_KEY = "connectmw_auth_user";

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  roles: string[];
  providers: SessionProvider[];
  activeRole: string;
  activeProviderId: string | null;
  canSwitchRoles: boolean;
  mustChangePassword?: boolean;
  avatarUrl?: string | null;
  fullName?: string;
  city?: string | null;
  district?: string | null;
  streetAddress?: string | null;
  nationality?: string | null;
  preferredLanguage?: string | null;
  bio?: string | null;
  businessName?: string;
  companyName?: string;
  garageName?: string;
}

export interface SessionProvider {
  id: string;
  type: string | null;
  role: string;
  display_name: string | null;
  business_name: string | null;
  verification_status: string;
  is_verified: boolean;
}

const ROLE_KEY_MAP: Record<string, string> = {
  spare_seller: "spareSeller",
  beauty_provider: "beautyProvider",
  landlord: "landlord",
  agent: "agent",
};

const SESSION_WORKSPACE_KEY = "connectmw_active_workspace";

function normalizeRole(role?: string | null): string {
  if (!role) return "customer";
  return ROLE_KEY_MAP[role] ?? role;
}

function getSavedWorkspace() {
  try {
    const raw = localStorage.getItem(SESSION_WORKSPACE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { activeRole?: string; activeProviderId?: string | null };
  } catch {
    return null;
  }
}

function getStaffRole(roles: string[]): string | null {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("support")) return "support";
  return null;
}

function tokenIsExpired() {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return true;
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return Boolean(payload.exp && payload.exp * 1000 <= Date.now());
  } catch {
    return true;
  }
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    if (tokenIsExpired()) {
      clearSession();
      return null;
    }
    const { user, profile } = JSON.parse(raw);

    const fullName: string = profile?.full_name ?? "";
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" "); // handles middle names too

    const providers: SessionProvider[] = (user.providers ?? []).map((provider: any) => ({
      id: provider.id,
      type: provider.type ?? null,
      role: normalizeRole(provider.type),
      display_name: provider.display_name ?? null,
      business_name: provider.business_name ?? null,
      verification_status: provider.verification_status ?? "pending",
      is_verified: Boolean(provider.is_verified),
    }));
    const roles = Array.isArray(user.roles) ? user.roles : ["customer"];
    const workspace = getSavedWorkspace();
    const savedProvider = providers.find((provider) => provider.id === workspace?.activeProviderId);
    const staffRole = getStaffRole(roles);
    const savedAccountRole = workspace?.activeRole === "customer"
      || (workspace?.activeRole === "admin" && roles.includes("admin"))
      || (workspace?.activeRole === "support" && roles.includes("support"))
      ? workspace.activeRole
      : null;
    const activeProvider = savedProvider ?? null;
    const activeRole = activeProvider ? activeProvider.role : savedAccountRole ?? staffRole ?? "customer";

    return {
      id: user.id,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone,
      role: activeRole,
      roles,
      providers,
      activeRole,
      activeProviderId: activeProvider?.id ?? null,
      canSwitchRoles: providers.length > 0 || Boolean(staffRole),
      mustChangePassword: Boolean(user.must_change_password),
      avatarUrl: profile?.avatar_url ?? null,
      fullName,
      city: profile?.city ?? null,
      district: profile?.district ?? null,
      streetAddress: profile?.street_address ?? null,
      nationality: profile?.nationality ?? null,
      preferredLanguage: profile?.preferred_language ?? null,
      bio: profile?.bio ?? null,
      businessName: activeProvider?.business_name ?? undefined,
    };
  } catch {
    return null;
  }
}

export function setActiveWorkspace(activeRole: string, activeProviderId: string | null) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    SESSION_WORKSPACE_KEY,
    JSON.stringify({ activeRole, activeProviderId })
  );
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(SESSION_WORKSPACE_KEY);
}
