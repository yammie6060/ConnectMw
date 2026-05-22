import { AdminProviderCreatePayload, AdminTab, OwnerProviderFormData, StaffCreatePayload } from "../types";

export const TABS: [AdminTab, string][] = [
  ["overview", "Overview"],
  ["users", "Users"],
  ["staff", "Staff"],
  ["providers", "Providers"],
  ["support", "Support"],
  ["payments", "Payments"],
  ["reviews", "Reviews"],
];

export const EMPTY_STAFF_FORM: StaffCreatePayload = {
  full_name: "",
  email: "",
  phone: "",
  role: "support",
};

export const EMPTY_PROVIDER_FORM: AdminProviderCreatePayload = {
  provider_type_name: "",
  business_name: "",
  business_license: "",
  physical_address: "",
};

export const EMPTY_OWNER_PROVIDER_FORM: OwnerProviderFormData = {
  provider_type_name: "",
  owner_full_name: "",
  owner_email: "",
  owner_phone: "",
  business_name: "",
  business_license: "",
  physical_address: "",
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated, #1a2e42)",
  color: "var(--text-primary, white)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "8px",
  padding: "9px 12px",
  fontSize: "13px",
  outline: "none",
};