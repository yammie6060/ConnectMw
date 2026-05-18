import { apiRequest } from "./api";
import { getToken } from "./auth.service";


export type ProviderTypeOption = {
  id: string;
  name: string;
  display_name: string;
  requires_business_license: boolean;
  requires_physical_address: boolean;
  verification_fee: number;
  created_at: string;
};

export type BusinessHour = {
  day_of_week: number; // 0 = Monday … 6 = Sunday
  opens_at: string | null; // "HH:MM"
  closes_at: string | null; // "HH:MM"
  is_closed: boolean;
};

export type BusinessDocument = {
  id: string;
  document_type: string;
  document_url: string;
  is_verified: boolean;
  uploaded_at: string | null;
};

export type ProviderProfile = {
  id: string;
  business_name: string | null;
  business_license: string | null;
  physical_address: string | null;
  is_verified: boolean;
  verification_status: string;
  created_at: string | null;
  provider_type: {
    name: string;
    display_name: string;
    requires_business_license: boolean;
    requires_physical_address: boolean;
    verification_fee: number;
  } | null;
};

export type CompleteProviderProfile = {
  provider: ProviderProfile;
  business_hours: (BusinessHour & { id?: string })[];
  documents: BusinessDocument[];
  metrics: {
    completed_orders: number;
    completed_bookings: number;
    cancelled_orders: number;
    response_rate: number;
  };
};


function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}


export const providerService = {

  getProviderTypes() {
    return apiRequest<ProviderTypeOption[]>("/provider/types", {
      method: "GET",
    });
  },


  getMyProviders() {
    return apiRequest<ProviderTypeOption[]>("/provider/my-providers", {
      method: "GET",
      headers: authHeaders(),
    });
  },


  getCompleteProfile(providerId: string) {
    return apiRequest<CompleteProviderProfile>(
      `/provider/${providerId}/complete-profile`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );
  },


  updateProfile(
    providerId: string,
    data: {
      business_name?: string;
      business_license?: string;
      physical_address?: string;
    }
  ) {
    return apiRequest(`/provider/${providerId}/profile`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
  },

  setBusinessHours(providerId: string, hours: BusinessHour[]) {
    return apiRequest(`/provider/${providerId}/business-hours`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(hours),
    });
  },


  uploadDocument(
    providerId: string,
    documentType: string,
    documentUrl: string
  ) {
    return apiRequest(`/provider/${providerId}/documents`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ document_type: documentType, document_url: documentUrl }),
    });
  },


  deleteDocument(providerId: string, documentId: string) {
    return apiRequest(`/provider/${providerId}/documents/${documentId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },


  submitForVerification(providerId: string) {
    return apiRequest(`/provider/${providerId}/submit-verification`, {
      method: "POST",
      headers: authHeaders(),
    });
  },


  getPublicProfile(providerId: string) {
    return apiRequest(`/provider/${providerId}`, {
      method: "GET",
    });
  },
};