import { apiRequest } from "./api";
import { getToken } from "./auth.service";

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type ManagedProvider = {
  id: string;
  user_id: string;
  type: string | null;
  display_name: string | null;
  business_name: string | null;
  business_license?: string | null;
  physical_address?: string | null;
  is_verified: boolean;
  verification_status: string;
  created_at: string | null;
};

export type ManagedUser = {
  id: string;
  email: string;
  phone: string;
  is_verified: boolean;
  is_active: boolean;
  /** True when a staff account has never changed its system-generated password. */
  must_change_password: boolean;
  roles: string[];
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    city: string | null;
    district: string | null;
    bio: string | null;
  } | null;
  providers: ManagedProvider[];
  created_at: string | null;
  last_login_at: string | null;
};

export type ManagedReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
  reviewer: { id: string; email: string; phone: string };
  provider: {
    id: string;
    user_id: string;
    business_name: string | null;
    type: string | null;
    display_name: string | null;
  };
};

export type ManagementOverview = {
  users: { total: number; active: number; suspended: number; unverified: number };
  providers: { total: number; pending: number; approved: number; rejected: number };
  reviews: { total: number };
  payments: { total: number; pending: number; paid: number; failed: number };
  support: { open: number; in_progress: number };
};

export type ManagedPayment = {
  id: string;
  user_id: string | null;
  payment_type: string;
  reference_type: string | null;
  reference_id: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  transaction_reference: string | null;
  status: string;
  paid_at: string | null;
  created_at: string | null;
  user: { id: string; email: string; phone: string } | null;
};

/**
 * Payload for creating a new staff account.
 * Password is intentionally absent — the system generates a temporary
 * one-time password and emails it to the new staff member.
 */
export type StaffCreatePayload = {
  email: string;
  phone: string;
  full_name: string;
  role: "support" | "admin";
};

export type AdminProviderCreatePayload = {
  provider_type_name: string;
  business_name?: string;
  business_license?: string;
  physical_address?: string;
};

export type SupportTicket = {
  id: string;
  user_id: string | null;
  assigned_to: string | null;
  category: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string | null;
  updated_at: string | null;
  user: { id: string; email: string; phone: string } | null;
};

export const adminService = {
  getOverview() {
    return apiRequest<ManagementOverview>("/users/overview", {
      method: "GET",
      headers: authHeaders(),
    });
  },

  listUsers() {
    return apiRequest<{ items: ManagedUser[]; total: number }>("/users?limit=100", {
      method: "GET",
      headers: authHeaders(),
    });
  },

  listStaff() {
    return apiRequest<{ items: ManagedUser[]; total: number }>("/users/staff", {
      method: "GET",
      headers: authHeaders(),
    });
  },

  /** Creates a staff account. The backend generates and emails a temporary password. */
  createStaff(payload: StaffCreatePayload) {
    return apiRequest<ManagedUser>("/users/staff", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  },

  listReviews() {
    return apiRequest<{ items: ManagedReview[]; total: number }>("/users/reviews?limit=100", {
      method: "GET",
      headers: authHeaders(),
    });
  },

  listPayments() {
    return apiRequest<{ items: ManagedPayment[]; total: number }>("/users/payments?limit=100", {
      method: "GET",
      headers: authHeaders(),
    });
  },

  listSupportTickets() {
    return apiRequest<{ items: SupportTicket[]; total: number }>("/users/support-tickets?limit=100", {
      method: "GET",
      headers: authHeaders(),
    });
  },

  updateSupportTicket(ticketId: string, status: string) {
    return apiRequest(`/users/support-tickets/${ticketId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
  },

  setUserStatus(userId: string, isActive: boolean) {
    return apiRequest<ManagedUser>(`/users/${userId}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  assignRole(userId: string, role: string) {
    return apiRequest<ManagedUser>(`/users/${userId}/roles`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    });
  },

  removeRole(userId: string, role: string) {
    return apiRequest<ManagedUser>(`/users/${userId}/roles/${role}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },

  reviewProvider(userId: string, providerId: string, status: "approved" | "rejected", notes?: string) {
    return apiRequest<ManagedProvider>(`/users/${userId}/providers/${providerId}/verification`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ status, notes }),
    });
  },

  createProvider(userId: string, payload: AdminProviderCreatePayload) {
    return apiRequest<ManagedUser>(`/users/${userId}/providers`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  },
};
