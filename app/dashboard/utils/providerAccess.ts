import { ManagedProvider } from "@/services/admin.service";
import { providerService } from "@/services/provider.service";
import { SessionUser } from "../types/dashboard";

export type ProviderOption = ManagedProvider & {
  ownerEmail?: string;
};

export function canActAsStaff(user?: SessionUser | null) {
  return Boolean(user?.roles?.some((role) => role === "admin" || role === "support"));
}

export function providerKindForRole(role: string): string | null {
  if (role === "landlord" || role === "agent") return "property";
  if (role === "spareSeller") return "spare_seller";
  if (role === "beautyProvider") return "beauty_provider";
  return null;
}

export function providerKindForService(kind: "property" | "spare" | "beauty"): string[] {
  if (kind === "property") return ["landlord", "agent"];
  if (kind === "spare") return ["spare_seller"];
  return ["beauty_provider"];
}

export function sessionProviderOptions(user: SessionUser, kind?: "property" | "spare" | "beauty"): ProviderOption[] {
  const allowed = kind ? providerKindForService(kind) : null;
  return user.providers
    .filter((provider) => !allowed || (provider.type ? allowed.includes(provider.type) : false))
    .map((provider) => ({
      id: provider.id,
      user_id: user.id ?? "",
      type: provider.type,
      display_name: provider.display_name,
      business_name: provider.business_name,
      is_verified: provider.is_verified,
      verification_status: provider.verification_status,
      created_at: null,
    }));
}

export async function loadStaffProviderOptions(kind?: "property" | "spare" | "beauty") {
  const allowed = kind ? providerKindForService(kind) : null;
  const response = await providerService.getAllProvidersForStaff();
  return (response.data ?? [])
    .filter((provider) => !allowed || (provider.type ? allowed.includes(provider.type) : false))
    .map((provider) => ({
      id: provider.id,
      user_id: provider.user_id,
      type: provider.type,
      display_name: provider.display_name,
      business_name: provider.business_name,
      business_license: provider.business_license,
      physical_address: provider.physical_address,
      is_verified: provider.is_verified,
      verification_status: provider.verification_status,
      created_at: provider.created_at,
      ownerEmail: provider.ownerEmail ?? undefined,
    }));
}
