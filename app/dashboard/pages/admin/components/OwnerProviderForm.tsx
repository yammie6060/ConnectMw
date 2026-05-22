import React from "react";
import { Building2, Loader2, UserPlus } from "lucide-react";
import { ProviderTypeOption } from "@/services/provider.service";
import { OwnerProviderFormData, OwnerProviderFormUpdateHandler } from "@/types";
import { inputStyle } from "@/constants";

interface OwnerProviderFormProps {
  providerTypes: ProviderTypeOption[];
  formData: OwnerProviderFormData;
  loading: boolean;
  color: string;
  onChange: OwnerProviderFormUpdateHandler;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function OwnerProviderForm({
  providerTypes,
  formData,
  loading,
  color,
  onChange,
  onSubmit,
}: OwnerProviderFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl p-4 space-y-3"
      style={{
        background: "var(--bg-secondary, #132333)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-start gap-2">
        <Building2 size={16} style={{ color, marginTop: 2 }} />
        <div>
          <div className="font-bold text-sm" style={{ color: "var(--text-primary, white)" }}>
            Register New Business Provider
          </div>
          <p className="text-xs mt-1" style={{ color: "#8ca5bc" }}>
            Create a new provider workspace with an owner account. The owner will receive login credentials via email.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <select
          value={formData.provider_type_name}
          onChange={(e) => onChange({ provider_type_name: e.target.value })}
          style={inputStyle}
          required
        >
          <option value="">Select provider type</option>
          {providerTypes.map((type) => (
            <option key={type.id} value={type.name}>
              {type.display_name}
            </option>
          ))}
        </select>
        
        <input
          required
          value={formData.owner_full_name}
          onChange={(e) => onChange({ owner_full_name: e.target.value })}
          placeholder="Owner full name *"
          style={inputStyle}
        />
        
        <input
          required
          type="email"
          value={formData.owner_email}
          onChange={(e) => onChange({ owner_email: e.target.value })}
          placeholder="Owner email *"
          style={inputStyle}
        />
        
        <input
          required
          value={formData.owner_phone}
          onChange={(e) => onChange({ owner_phone: e.target.value })}
          placeholder="Owner phone *"
          style={inputStyle}
        />
        
        <input
          value={formData.business_name}
          onChange={(e) => onChange({ business_name: e.target.value })}
          placeholder="Business name (optional)"
          style={inputStyle}
        />
        
        <input
          value={formData.business_license}
          onChange={(e) => onChange({ business_license: e.target.value })}
          placeholder="Business license (optional)"
          style={inputStyle}
        />
        
        <input
          className="sm:col-span-2"
          value={formData.physical_address}
          onChange={(e) => onChange({ physical_address: e.target.value })}
          placeholder="Physical address (optional)"
          style={inputStyle}
        />
      </div>
      
      <button
        type="submit"
        disabled={loading || providerTypes.length === 0}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold disabled:opacity-50 transition-all hover:opacity-90"
        style={{ background: color, color: "#0d1f2d" }}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <UserPlus size={14} />
        )}
        {loading ? "Creating Workspace..." : "Create Provider Workspace"}
      </button>
    </form>
  );
}