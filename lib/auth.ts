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
  businessName?: string;
  companyName?: string;
  garageName?: string;
}

const ROLE_KEY_MAP: Record<string, string> = {
  spare_seller: "spareSeller",
  beauty_provider: "beautyProvider",
};

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("connectmw_auth_user");
    if (!raw) return null;
    const { user, profile } = JSON.parse(raw);

    const fullName: string = profile?.full_name ?? "";
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" "); // handles middle names too

    let role = "customer";
    if (user.providers?.length > 0) {
      const providerType = user.providers[0].type ?? "customer";
      role = ROLE_KEY_MAP[providerType] ?? providerType;
    } else if (user.roles?.includes("customer")) {
      role = "customer";
    }

    return {
      id: user.id,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone,
      role,
      businessName: user.providers?.[0]?.business_name ?? undefined,
    };
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
