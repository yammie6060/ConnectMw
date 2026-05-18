// services/auth.service.ts
import { apiRequest } from "./api";

const ACCESS_TOKEN_KEY = "connectmw_access_token";
const AUTH_USER_KEY = "connectmw_auth_user";

export type RegisterPayload = {
  email: string;
  phone: string;
  password: string;
  full_name: string;
  register_as_provider: boolean;
  provider_type?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  phone: string;
  is_verified: boolean;
  is_active: boolean;
  roles: string[];
  providers: Array<{
    id: string;
    type: string | null;
    display_name: string | null;
    business_name: string | null;
    verification_status: string;
    is_verified: boolean;
  }>;
  created_at: string | null;
  last_login_at: string | null;
};

export type UserProfile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  gender: string | null;
  date_of_birth: string | null;
  city: string | null;
  district: string | null;
  street_address: string | null;
  nationality: string | null;
  preferred_language: string | null;
  bio: string | null;
};

export type LoginData = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  user: AuthUser;
  profile: UserProfile | null;
};

export type ProviderInfo = {
  provider_id: string;
  provider_type: string;
  provider_type_display: string;
  verification_status: string;
  requires_business_license: boolean;
  requires_physical_address: boolean;
};

export type RegisterData = {
  user_id: string;
  email: string;
  phone: string;
  is_provider: boolean;
  provider_info: ProviderInfo | null;
  verification_sent: boolean;
  requires_verification: boolean;
};

export type SessionData = {
  user: AuthUser;
  profile: UserProfile | null;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getSession(): SessionData | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

function setSession(data: LoginData): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  window.localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({ user: data.user, profile: data.profile } satisfies SessionData)
  );
}

export const authService = {
  register(payload: RegisterPayload) {
    return apiRequest<RegisterData>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload) {
    const response = await apiRequest<LoginData>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (response.data) {
      setSession(response.data);
    }
    return response;
  },

  async verifyEmail(email: string, code: string) {
    const response = await apiRequest<LoginData>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    if (response.data?.access_token) {
      setSession(response.data);
    }
    return response;
  },

  resendVerification(email: string) {
    return apiRequest("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  forgotPassword(email: string) {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(email: string, code: string, newPassword: string) {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, new_password: newPassword }),
    });
  },

  async me() {
    const token = getToken();
    return apiRequest<{ user: AuthUser; profile: UserProfile | null }>("/auth/me", {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  logout: clearSession,
};
