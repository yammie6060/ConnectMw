import { API_BASE_URL, ApiError, apiRequest } from "./api";
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
  day_of_week: number; 
  opens_at: string | null; 
  closes_at: string | null; 
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

export type ListingImage = {
  id?: string;
  image_url: string;
  is_primary?: boolean;
};

export type ServiceListing = {
  id: string;
  kind: "property" | "spare" | "beauty";
  provider_id: string;
  title: string;
  name?: string;
  description?: string | null;
  price?: number | null;
  city?: string | null;
  district?: string | null;
  street_address?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqm?: number | null;
  property_type?: string | null;
  property_type_display?: string | null;
  amenities?: Array<{ id: string; name: string }>;
  amenity_ids?: string[];
  vehicle_type?: string | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  part_name?: string | null;
  condition?: string | null;
  quantity?: number | null;
  is_available: boolean;
  is_sold?: boolean;
  status: string;
  category?: string | null;
  category_display?: string | null;
  duration_minutes?: number | null;
  primary_image?: string | null;
  images: ListingImage[];
  provider?: {
    id: string;
    business_name: string | null;
    type: string | null;
    display_name: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PropertyListingPayload = {
  provider_id: string;
  property_type: string;
  title: string;
  description?: string;
  price?: number | null;
  city?: string;
  district?: string;
  street_address?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqm?: number | null;
  is_available: boolean;
  amenity_ids?: string[];
  images: Array<{ image_url: string; is_primary?: boolean }>;
};

export type SpareListingPayload = {
  provider_id: string;
  title: string;
  description?: string;
  vehicle_type?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  part_name?: string;
  condition?: string;
  price?: number | null;
  quantity: number;
  city?: string;
  is_available: boolean;
  images: Array<{ image_url: string; is_primary?: boolean }>;
};

export type BeautyServicePayload = {
  provider_id: string;
  category: string;
  name: string;
  description?: string;
  duration_minutes?: number | null;
  price?: number | null;
  is_available: boolean;
  images: Array<{ image_url: string; is_primary?: boolean }>;
};

export type ListingActionPayload = {
  message?: string;
  quantity?: number;
  booking_date?: string;
  start_time?: string;
  notes?: string;
};

export type ServiceInteraction = {
  id: string;
  kind: "property" | "spare" | "beauty";
  type: "rental_application" | "booking" | "order";
  status: string;
  message?: string | null;
  notes?: string | null;
  order_number?: string | null;
  quantity?: number | null;
  total_amount?: number | null;
  booking_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  listing: ServiceListing | null;
  provider: ServiceListing["provider"];
  customer?: { id: string; email: string; phone: string; full_name?: string | null } | null;
};

export type ProviderReview = {
  id: string;
  rating: number;
  comment?: string | null;
  created_at?: string | null;
  reviewer?: { id: string; email: string; phone: string; full_name?: string | null } | null;
  provider_id: string;
};


function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function mediaUrl(url?: string | null) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}


export const providerService = {

  getProviderTypes() {
    return apiRequest<ProviderTypeOption[]>("/provider/types", {
      method: "GET",
    });
  },


  getMyProviders() {
    return apiRequest<ProviderProfile[]>("/provider/my-providers", {
      method: "GET",
      headers: authHeaders(),
    });
  },

  getAllProvidersForStaff() {
    return apiRequest<Array<ProviderProfile & { user_id: string; type: string | null; display_name: string | null; ownerEmail?: string | null }>>("/provider/staff/all", {
      method: "GET",
      headers: authHeaders(),
    });
  },


  becomeProvider(data: {
    provider_type_name: string;
    business_name?: string;
    business_license?: string;
    physical_address?: string;
  }) {
    return apiRequest<{
      provider_id: string;
      provider_type: string;
      display_name: string;
      verification_status: string;
      requires_business_license: boolean;
      requires_physical_address: boolean;
    }>("/provider/become-provider", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
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
      headers: authHeaders(),
    });
  },

  getListingOptions() {
    return apiRequest<{
      property_types: Array<{ id: string; name: string; display_name: string }>;
      beauty_categories: Array<{ id: string; name: string; display_name: string; icon?: string | null }>;
      amenities: Array<{ id: string; name: string }>;
    }>("/services/options", { method: "GET", headers: authHeaders() });
  },

  browseServices(kind?: "property" | "spare" | "beauty", search?: string) {
    const params = new URLSearchParams();
    if (kind) params.set("kind", kind);
    if (search) params.set("search", search);
    const query = params.toString();
    return apiRequest<{ items: ServiceListing[]; total: number }>(`/services${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: authHeaders(),
    });
  },

  listInteractions(options: { scope?: "customer" | "provider"; type?: "rental_application" | "booking" | "order"; providerId?: string } = {}) {
    const params = new URLSearchParams();
    if (options.scope) params.set("scope", options.scope);
    if (options.type) params.set("type", options.type);
    if (options.providerId) params.set("provider_id", options.providerId);
    const query = params.toString();
    return apiRequest<{ items: ServiceInteraction[]; total: number }>(`/services/interactions${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: authHeaders(),
    });
  },

  listReviews(providerId?: string) {
    const query = providerId ? `?provider_id=${providerId}` : "";
    return apiRequest<{ items: ProviderReview[]; total: number; average: number }>(`/services/reviews${query}`, {
      method: "GET",
      headers: authHeaders(),
    });
  },

  listProviderServices(providerId: string, kind?: "property" | "spare" | "beauty") {
    const query = kind ? `?kind=${kind}` : "";
    return apiRequest<{ items: ServiceListing[]; total: number }>(`/services/provider/${providerId}${query}`, {
      method: "GET",
      headers: authHeaders(),
    });
  },

  createPropertyListing(payload: PropertyListingPayload) {
    return apiRequest<ServiceListing>("/services/properties", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  },

  createProviderForOwner(data: {
    provider_type_name: string;
    owner_full_name: string;
    owner_email: string;
    owner_phone: string;
    business_name?: string;
    business_license?: string;
    physical_address?: string;
  }) {
    return apiRequest<ProviderProfile & { user_id: string; type: string | null; display_name: string | null; ownerEmail?: string | null; ownerPhone?: string | null }>("/provider/staff/providers", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
  },

  updatePropertyListing(itemId: string, payload: PropertyListingPayload) {
    return apiRequest<ServiceListing>(`/services/properties/${itemId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  },

  createSpareListing(payload: SpareListingPayload) {
    return apiRequest<ServiceListing>("/services/spares", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  },

  updateSpareListing(itemId: string, payload: SpareListingPayload) {
    return apiRequest<ServiceListing>(`/services/spares/${itemId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  },

  createBeautyService(payload: BeautyServicePayload) {
    return apiRequest<ServiceListing>("/services/beauty", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  },

  updateBeautyService(itemId: string, payload: BeautyServicePayload) {
    return apiRequest<ServiceListing>(`/services/beauty/${itemId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  },

  deleteListing(kind: "properties" | "spares" | "beauty", itemId: string) {
    return apiRequest(`/services/${kind}/${itemId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },

  createListingAction(kind: "property" | "spare" | "beauty", itemId: string, payload: ListingActionPayload) {
    return apiRequest<{ id: string; status: string; order_number?: string }>(`/services/${kind}/${itemId}/action`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  },

  async searchSparesByPhoto(file: File, search?: string) {
    const form = new FormData();
    form.append("file", file);
    if (search) form.append("search", search);
    const response = await fetch(`${API_BASE_URL}/services/spares/photo-search`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(data?.detail || data?.message || "Photo search failed.", response.status, data);
    }
    return data as { success: boolean; message: string; data?: { items: ServiceListing[]; total: number; ai_status: string } };
  },

  async uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${API_BASE_URL}/uploads/images`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401) {
        authServiceSafeClear();
      }
      throw new ApiError(data?.detail || data?.message || "Image upload failed.", response.status, data);
    }
    return data as { success: boolean; message: string; data?: { image_url: string } };
  },
};

function authServiceSafeClear() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("connectmw_access_token");
  window.localStorage.removeItem("connectmw_auth_user");
  window.localStorage.removeItem("connectmw_active_workspace");
  window.location.assign("/signin");
}
