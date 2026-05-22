import { useState } from "react";
import { adminService } from "@/services/admin.service";
import { providerService } from "@/services/provider.service";
import { AdminProviderCreatePayload, OwnerProviderFormData } from "../types";
import { EMPTY_PROVIDER_FORM, EMPTY_OWNER_PROVIDER_FORM } from "../constants";

export function useProviderForms(providerTypes: any[], onActionComplete: () => Promise<void>) {
  const [providerForms, setProviderForms] = useState<Record<string, AdminProviderCreatePayload>>({});
  const [ownerProviderForm, setOwnerProviderForm] = useState<OwnerProviderFormData>(EMPTY_OWNER_PROVIDER_FORM);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const updateOwnerProviderForm = (updates: Partial<OwnerProviderFormData>) => {
    setOwnerProviderForm((prev) => ({ ...prev, ...updates }));
  };

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

  async function createProviderWorkspace(userId: string, form: AdminProviderCreatePayload) {
    if (!form.provider_type_name) {
      throw new Error("Choose a provider type first.");
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
      await onActionComplete();
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function createProviderForOwner(form: OwnerProviderFormData) {
    if (!form.provider_type_name || !form.owner_full_name.trim() || 
        !form.owner_email.trim() || !form.owner_phone.trim()) {
      throw new Error("Add provider type, owner name, email, and phone.");
    }
    const key = "owner-provider:create";
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await providerService.createProviderForOwner({
        provider_type_name: form.provider_type_name,
        owner_full_name: form.owner_full_name.trim(),
        owner_email: form.owner_email.trim(),
        owner_phone: form.owner_phone.trim(),
        business_name: form.business_name.trim() || form.owner_full_name.trim(),
        business_license: form.business_license.trim() || undefined,
        physical_address: form.physical_address.trim() || undefined,
      });
      setOwnerProviderForm(EMPTY_OWNER_PROVIDER_FORM);
      await onActionComplete();
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  return {
    providerForms,
    ownerProviderForm,
    actionLoading,
    updateProviderForm,
    createProviderWorkspace,
    createProviderForOwner,
    updateOwnerProviderForm,
    setOwnerProviderForm,
  };
}