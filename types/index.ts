import { ManagedUser, SupportTicket, ManagedPayment, ManagedReview, ManagementOverview } from "@/services/admin.service";
import { ProviderTypeOption } from "@/services/provider.service";

export type AdminTab = "overview" | "users" | "staff" | "providers" | "support" | "payments" | "reviews";

export interface AdminManagementPageProps {
  color: string;
  initialTab?: AdminTab;
  canManageRoles: boolean;
}

export interface StaffCreatePayload {
  full_name: string;
  email: string;
  phone: string;
  role: "support" | "admin";
}

export interface AdminProviderCreatePayload {
  provider_type_name: string;
  business_name?: string;
  business_license?: string;
  physical_address?: string;
}

export interface OwnerProviderFormData {
  provider_type_name: string;
  owner_full_name: string;
  owner_email: string;
  owner_phone: string;
  business_name: string;
  business_license: string;
  physical_address: string;
}

export interface UserWithProvider {
  user: ManagedUser;
  provider: any;
}

export type OwnerProviderFormUpdateHandler = (updates: Partial<OwnerProviderFormData>) => void;

export type UserSelectHandler = (user: ManagedUser) => void;

export type StaffFormChangeHandler = (form: StaffCreatePayload) => void;

export type ProviderFormUpdateHandler = (userId: string, patch: Partial<AdminProviderCreatePayload>) => void;