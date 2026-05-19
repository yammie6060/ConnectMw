"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Building2,
  Clock,
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getSession } from "@/services/auth.service";
import {
  providerService,
  BusinessHour,
  CompleteProviderProfile,
} from "@/services/provider.service";

type Step = "profile" | "hours" | "documents" | "done";

const DAYS = [
  "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday", "Sunday",
];

const DEFAULT_HOURS: BusinessHour[] = DAYS.map((_, i) => ({
  day_of_week: i,
  opens_at: "08:00",
  closes_at: "17:00",
  is_closed: i >= 5,
}));

// Responsive Step Indicator
function StepIndicator({ current, steps }: { current: Step; steps: Step[] }) {
  const labels: Record<Step, string> = {
    profile:   "Business",
    hours:     "Hours",
    documents: "Submit",
    done:      "Done",
  };
  const icons: Record<Step, typeof Building2> = {
    profile:   Building2,
    hours:     Clock,
    documents: FileText,
    done:      CheckCircle2,
  };

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      marginBottom: "clamp(1rem, 5vw, 2rem)", 
      gap: 0,
      flexWrap: "wrap",
      justifyContent: "center"
    }}>
      {steps.map((step, i) => {
        const isActive   = step === current;
        const isDone     = steps.indexOf(current) > i;
        const Icon = icons[step];
        return (
          <div key={step} style={{ 
            display: "flex", 
            alignItems: "center", 
            flex: i < steps.length - 1 ? 1 : "none",
            minWidth: i < steps.length - 1 ? "auto" : "unset"
          }}>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: "0.3rem" 
            }}>
              <div style={{
                width: "clamp(28px, 8vw, 36px)", 
                height: "clamp(28px, 8vw, 36px)", 
                borderRadius: "50%",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                background: isDone || isActive ? "var(--accent)" : "var(--bg-elevated)",
                border: `2px solid ${isDone || isActive ? "var(--accent)" : "var(--border)"}`,
                transition: "all 0.2s",
              }}>
                <Icon size={clamp(14, 4, 16)} color={isDone || isActive ? "#fff" : "var(--text-secondary)"} />
              </div>
              <span style={{
                fontSize: "clamp(0.6rem, 3vw, 0.65rem)", 
                fontWeight: 600, 
                whiteSpace: "nowrap",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
              }}>
                {labels[step]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, 
                height: 2, 
                margin: "0 0.25rem", 
                marginBottom: "1rem",
                background: isDone ? "var(--accent)" : "var(--border)",
                transition: "background 0.3s",
                minWidth: "20px"
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label, helper, children,
}: {
  label: string; helper?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ 
        display: "block", 
        fontSize: "clamp(0.7rem, 3vw, 0.75rem)", 
        fontWeight: 600, 
        color: "var(--text-secondary)", 
        marginBottom: "0.35rem", 
        letterSpacing: "0.03em" 
      }}>
        {label}
      </label>
      {children}
      {helper && (
        <span style={{ 
          display: "block", 
          fontSize: "clamp(0.65rem, 2.5vw, 0.7rem)", 
          color: "var(--text-secondary)", 
          marginTop: "0.25rem" 
        }}>
          {helper}
        </span>
      )}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%", 
        boxSizing: "border-box",
        background: "var(--bg-elevated)", 
        border: "1.5px solid var(--border)",
        borderRadius: "clamp(8px, 3vw, 10px)", 
        color: "var(--text-primary)",
        padding: "clamp(0.5rem, 2vw, 0.65rem) clamp(0.7rem, 3vw, 0.9rem)", 
        fontSize: "clamp(0.8rem, 3vw, 0.875rem)",
        fontFamily: "DM Sans, sans-serif", 
        outline: "none",
        transition: "border-color 0.15s",
        ...props.style,
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; props.onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; props.onBlur?.(e); }}
    />
  );
}

function PrimaryBtn({
  children, onClick, disabled, type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "clamp(0.6rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.75rem)", 
        borderRadius: 999,
        background: "var(--accent)", 
        color: "#fff",
        fontWeight: 700, 
        fontSize: "clamp(0.8rem, 3vw, 0.9rem)",
        border: "none", 
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        display: "flex", 
        alignItems: "center", 
        gap: "0.4rem",
        transition: "opacity 0.15s",
        whiteSpace: "nowrap"
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({
  children, onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "clamp(0.6rem, 2vw, 0.72rem) clamp(1rem, 4vw, 1.5rem)", 
        borderRadius: 999,
        background: "transparent", 
        color: "var(--text-secondary)",
        fontWeight: 600, 
        fontSize: "clamp(0.8rem, 3vw, 0.9rem)",
        border: "1.5px solid var(--border)",
        cursor: "pointer", 
        transition: "border-color 0.15s, color 0.15s",
        whiteSpace: "nowrap"
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
    >
      {children}
    </button>
  );
}

// Helper function for responsive icon sizes
function clamp(min: number, vw: number, max: number): number {
  if (typeof window === 'undefined') return max;
  const viewportWidth = window.innerWidth;
  const size = min + (viewportWidth * vw / 100);
  return Math.min(max, Math.max(min, size));
}

// Main Page
export default function ProviderSetupPage() {
  const params = useParams();
  const providerId = params?.providerId as string;
  const router = useRouter();

  const [step, setStep]         = useState<Step>("profile");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [profileData, setProfileData] = useState<CompleteProviderProfile | null>(null);
  const [businessName, setBusinessName]       = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [hours, setHours]                     = useState<BusinessHour[]>(DEFAULT_HOURS);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auth guard
  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/signin");
      return;
    }
    if (!providerId) {
      router.replace("/dashboard");
      return;
    }

    providerService
      .getCompleteProfile(providerId)
      .then((res) => {
        if (res.data) {
          setProfileData(res.data);
          setBusinessName(res.data.provider.business_name ?? "");
          setBusinessLicense(res.data.provider.business_license ?? "");
          setPhysicalAddress(res.data.provider.physical_address ?? "");
          if (res.data.business_hours.length === 7) {
            setHours(res.data.business_hours as BusinessHour[]);
          }
          if (res.data.provider.verification_status === "approved") {
            setStep("done");
          }
        }
      })
      .catch(() => setError("Could not load your provider profile. Please refresh."))
      .finally(() => setLoading(false));
  }, [providerId, router]);

  const saveProfile = useCallback(async () => {
    if (!businessName.trim()) { setError("Business name is required."); return; }
    const pt = profileData?.provider.provider_type;
    if (pt?.requires_physical_address && !physicalAddress.trim()) {
      setError("Physical address is required for this provider type.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await providerService.updateProfile(providerId, {
        business_name: businessName.trim(),
        business_license: businessLicense.trim() || undefined,
        physical_address: physicalAddress.trim() || undefined,
      });
      setStep("hours");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [businessName, businessLicense, physicalAddress, profileData, providerId]);

  const saveHours = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      await providerService.setBusinessHours(providerId, hours);
      setStep("documents");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save hours.");
    } finally {
      setSaving(false);
    }
  }, [hours, providerId]);

  const submitVerification = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      await providerService.submitForVerification(providerId);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to submit. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [providerId]);

  const updateHour = (i: number, patch: Partial<BusinessHour>) =>
    setHours((hs) => hs.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));

  if (loading) {
    return (
      <PageShell>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "0.75rem", 
          color: "var(--text-secondary)", 
          padding: "clamp(2rem, 10vw, 4rem) 0" 
        }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          <span>Loading your provider profile…</span>
        </div>
      </PageShell>
    );
  }

  const pt = profileData?.provider.provider_type;
  const fee = pt?.verification_fee ?? 0;
  const verificationStatus = profileData?.provider.verification_status ?? "pending";
  const isApproved = verificationStatus === "approved";
  const isRejected = verificationStatus === "rejected";
  const steps: Step[] = ["profile", "hours", "documents", "done"];

  return (
    <PageShell>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .setup-card { animation: fadeUp 0.28s ease; }
        
        @media (max-width: 768px) {
          .setup-card {
            padding: 1.25rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .setup-card {
            padding: 1rem !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "clamp(1.5rem, 5vw, 2rem)" }}>
        <h1 style={{ 
          fontWeight: 900, 
          fontSize: "clamp(1.2rem, 5vw, 1.5rem)", 
          letterSpacing: "-0.02em", 
          color: "var(--text-primary)", 
          marginBottom: "0.25rem" 
        }}>
          Complete Your Provider Profile
        </h1>
        <p style={{ 
          color: "var(--text-secondary)", 
          fontSize: "clamp(0.75rem, 3vw, 0.875rem)" 
        }}>
          {pt?.display_name ?? "Provider"} · Finish setup to go live on ConnectMW
        </p>
      </div>

      <StepIndicator current={step} steps={steps} />

      {/* Global error */}
      {error && (
        <div style={{
          display: "flex", 
          alignItems: "center", 
          gap: "0.6rem",
          background: "rgba(239,68,68,0.12)", 
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "clamp(8px, 3vw, 10px)", 
          padding: "clamp(0.6rem, 2vw, 0.7rem) clamp(0.8rem, 3vw, 1rem)", 
          marginBottom: "1.25rem",
          color: "#f87171", 
          fontSize: "clamp(0.75rem, 3vw, 0.84rem)",
        }}>
          <AlertCircle size={clamp(13, 3, 15)} />
          {error}
        </div>
      )}

      <div className="setup-card" key={step} style={{
        background: "var(--bg-secondary)", 
        border: "1px solid var(--border)",
        borderRadius: "clamp(12px, 4vw, 16px)", 
        padding: "clamp(1rem, 4vw, 1.75rem) clamp(1rem, 5vw, 2rem)",
        boxShadow: "0 8px 32px var(--shadow)",
      }}>

        {/* STEP 1: Business Info */}
        {step === "profile" && (
          <div>
            <h2 style={{ 
              fontWeight: 700, 
              fontSize: "clamp(0.9rem, 4vw, 1.05rem)", 
              color: "var(--text-primary)", 
              marginBottom: "0.25rem" 
            }}>
              Business Information
            </h2>
            <p style={{ 
              fontSize: "clamp(0.75rem, 3vw, 0.82rem)", 
              color: "var(--text-secondary)", 
              marginBottom: "clamp(1rem, 4vw, 1.5rem)" 
            }}>
              This is what customers will see on your public profile.
            </p>

            <Field label="Business Name *">
              <Input
                placeholder="e.g. Mbewe Auto Spares"
                value={businessName}
                onChange={(e) => { setBusinessName(e.target.value); setError(""); }}
              />
            </Field>

            {pt?.requires_business_license && (
              <Field label="Business License Number" helper="Leave blank if not yet available — you can add it later.">
                <Input
                  placeholder="e.g. BL-2024-00123"
                  value={businessLicense}
                  onChange={(e) => setBusinessLicense(e.target.value)}
                />
              </Field>
            )}

            {pt?.requires_physical_address && (
              <Field label="Physical Address *" helper="Street, Area, City — e.g. Area 3, Lilongwe">
                <Input
                  placeholder="e.g. Area 3, Lilongwe"
                  value={physicalAddress}
                  onChange={(e) => { setPhysicalAddress(e.target.value); setError(""); }}
                />
              </Field>
            )}

            <div style={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              marginTop: "0.5rem" 
            }}>
              <PrimaryBtn onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 size={clamp(13, 3, 15)} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {saving ? "Saving…" : <>Continue <ChevronRight size={clamp(13, 3, 15)} /></>}
              </PrimaryBtn>
            </div>
          </div>
        )}

        {/* STEP 2: Business Hours - Responsive layout */}
        {step === "hours" && (
          <div>
            <h2 style={{ 
              fontWeight: 700, 
              fontSize: "clamp(0.9rem, 4vw, 1.05rem)", 
              color: "var(--text-primary)", 
              marginBottom: "0.25rem" 
            }}>
              Business Hours
            </h2>
            <p style={{ 
              fontSize: "clamp(0.75rem, 3vw, 0.82rem)", 
              color: "var(--text-secondary)", 
              marginBottom: "clamp(1rem, 4vw, 1.5rem)" 
            }}>
              Check the days you&apos;re open and set your opening and closing times.
            </p>

            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "0.6rem" 
            }}>
              {hours.map((h, i) => (
                <div key={i} style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "stretch" : "center",
                  gap: isMobile ? "0.5rem" : "0.75rem",
                  padding: "clamp(0.5rem, 2vw, 0.55rem) clamp(0.6rem, 2.5vw, 0.75rem)", 
                  borderRadius: 10,
                  background: h.is_closed ? "transparent" : "var(--bg-elevated)",
                  border: `1px solid ${h.is_closed ? "var(--border)" : "color-mix(in srgb, var(--accent) 20%, transparent)"}`,
                  opacity: h.is_closed ? 0.6 : 1,
                  transition: "all 0.15s",
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: isMobile ? "100%" : "auto"
                  }}>
                    <span style={{ 
                      fontSize: "clamp(0.75rem, 3vw, 0.82rem)", 
                      fontWeight: 600, 
                      color: "var(--text-secondary)",
                      minWidth: isMobile ? "auto" : "90px"
                    }}>
                      {DAYS[i]}
                    </span>

                    <label style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      cursor: "pointer",
                      marginLeft: isMobile ? "auto" : 0
                    }}>
                      <input
                        type="checkbox"
                        checked={!h.is_closed}
                        onChange={(e) => updateHour(i, { is_closed: !e.target.checked })}
                        style={{ accentColor: "var(--accent)", width: clamp(15, 4, 18), height: clamp(15, 4, 18) }}
                      />
                      <span style={{ 
                        fontSize: "clamp(0.7rem, 3vw, 0.78rem)", 
                        marginLeft: "0.5rem",
                        color: "var(--text-secondary)"
                      }}>
                        Open
                      </span>
                    </label>
                  </div>

                  {!h.is_closed ? (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.5rem",
                      flexDirection: isMobile ? "row" : "row",
                      width: isMobile ? "100%" : "auto"
                    }}>
                      <input
                        type="time"
                        value={h.opens_at ?? "08:00"}
                        onChange={(e) => updateHour(i, { opens_at: e.target.value })}
                        style={{
                          background: "var(--bg-primary)", 
                          border: "1.5px solid var(--border)",
                          borderRadius: 8, 
                          color: "var(--text-primary)",
                          padding: "clamp(0.3rem, 2vw, 0.4rem) clamp(0.4rem, 2vw, 0.5rem)", 
                          fontSize: "clamp(0.7rem, 3vw, 0.82rem)",
                          fontFamily: "DM Sans, sans-serif", 
                          outline: "none", 
                          flex: 1,
                        }}
                      />
                      <span style={{ color: "var(--text-secondary)", fontSize: "clamp(0.7rem, 3vw, 0.8rem)" }}>–</span>
                      <input
                        type="time"
                        value={h.closes_at ?? "17:00"}
                        onChange={(e) => updateHour(i, { closes_at: e.target.value })}
                        style={{
                          background: "var(--bg-primary)", 
                          border: "1.5px solid var(--border)",
                          borderRadius: 8, 
                          color: "var(--text-primary)",
                          padding: "clamp(0.3rem, 2vw, 0.4rem) clamp(0.4rem, 2vw, 0.5rem)", 
                          fontSize: "clamp(0.7rem, 3vw, 0.82rem)",
                          fontFamily: "DM Sans, sans-serif", 
                          outline: "none", 
                          flex: 1,
                        }}
                      />
                    </div>
                  ) : (
                    <span style={{ 
                      fontSize: "clamp(0.7rem, 3vw, 0.78rem)", 
                      color: "var(--text-secondary)",
                      marginTop: isMobile ? "0.25rem" : 0
                    }}>
                      Closed
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ 
              display: "flex", 
              gap: "0.75rem", 
              justifyContent: "space-between", 
              marginTop: "clamp(1rem, 5vw, 1.5rem)" 
            }}>
              <GhostBtn onClick={() => { setStep("profile"); setError(""); }}>← Back</GhostBtn>
              <PrimaryBtn onClick={saveHours} disabled={saving}>
                {saving ? <Loader2 size={clamp(13, 3, 15)} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {saving ? "Saving…" : <>Continue <ChevronRight size={clamp(13, 3, 15)} /></>}
              </PrimaryBtn>
            </div>
          </div>
        )}

        {/* STEP 3: Submit for Verification */}
        {step === "documents" && (
          <div>
            <h2 style={{ 
              fontWeight: 700, 
              fontSize: "clamp(0.9rem, 4vw, 1.05rem)", 
              color: "var(--text-primary)", 
              marginBottom: "0.25rem" 
            }}>
              Submit for Verification
            </h2>
            <p style={{ 
              fontSize: "clamp(0.75rem, 3vw, 0.82rem)", 
              color: "var(--text-secondary)", 
              marginBottom: "clamp(1rem, 4vw, 1.5rem)" 
            }}>
              Our team reviews every provider to keep ConnectMW safe and trustworthy.
            </p>

            <div style={{
              background: "var(--bg-elevated)", 
              borderRadius: "clamp(10px, 3vw, 12px)",
              border: "1px solid var(--border)", 
              padding: "clamp(0.8rem, 3vw, 1rem) clamp(1rem, 4vw, 1.25rem)",
              marginBottom: "1.25rem",
            }}>
              <div style={{ 
                fontSize: "clamp(0.7rem, 3vw, 0.8rem)", 
                color: "var(--text-secondary)", 
                marginBottom: "0.6rem", 
                fontWeight: 600, 
                textTransform: "uppercase", 
                letterSpacing: "0.05em" 
              }}>
                Profile Summary
              </div>
              <SummaryRow label="Business Name" value={businessName || "—"} />
              {pt?.requires_business_license && (
                <SummaryRow label="License" value={businessLicense || "Not provided"} />
              )}
              {pt?.requires_physical_address && (
                <SummaryRow label="Address" value={physicalAddress || "Not provided"} />
              )}
              <SummaryRow
                label="Open Days"
                value={`${hours.filter((h) => !h.is_closed).length} days/week`}
              />
            </div>

            {fee > 0 && (
              <div style={{
                background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent) 22%, transparent)",
                borderRadius: "clamp(8px, 3vw, 10px)", 
                padding: "clamp(0.6rem, 2vw, 0.75rem) clamp(0.8rem, 3vw, 1rem)", 
                marginBottom: "1.25rem",
                fontSize: "clamp(0.75rem, 3vw, 0.84rem)", 
                color: "var(--accent)", 
                fontWeight: 600,
              }}>
                Verification fee: MWK {fee.toLocaleString()}
              </div>
            )}

            <div style={{
              background: "rgba(16,185,129,0.07)", 
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "clamp(8px, 3vw, 10px)", 
              padding: "clamp(0.6rem, 2vw, 0.75rem) clamp(0.8rem, 3vw, 1rem)", 
              marginBottom: "1.5rem",
              fontSize: "clamp(0.75rem, 3vw, 0.82rem)", 
              color: "#34d399",
            }}>
              ✓ You can still browse and explore the platform while under review.
            </div>

            <div style={{ 
              display: "flex", 
              gap: "0.75rem", 
              justifyContent: "space-between",
              flexDirection: isMobile ? "column-reverse" : "row"
            }}>
              <GhostBtn onClick={() => { setStep("hours"); setError(""); }}>← Back</GhostBtn>
              <PrimaryBtn onClick={submitVerification} disabled={saving}>
                {saving ? <Loader2 size={clamp(13, 3, 15)} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {saving ? "Submitting…" : "Submit for Verification →"}
              </PrimaryBtn>
            </div>
          </div>
        )}

        {/* DONE */}
        {step === "done" && (
          <div style={{ textAlign: "center", padding: "clamp(0.5rem, 3vw, 1rem) 0 0.5rem" }}>
            <div style={{ fontSize: "clamp(2rem, 8vw, 3rem)", marginBottom: "1rem" }}>{isRejected ? "!" : "✓"}</div>
            <h2 style={{ 
              fontWeight: 800, 
              fontSize: "clamp(1rem, 5vw, 1.3rem)", 
              color: "var(--text-primary)", 
              marginBottom: "0.5rem" 
            }}>
              {isApproved ? "Provider Approved" : isRejected ? "Review Needs Attention" : "You're All Set!"}
            </h2>
            <p style={{ 
              fontSize: "clamp(0.8rem, 3vw, 0.875rem)", 
              color: "var(--text-secondary)", 
              marginBottom: "0.5rem" 
            }}>
              Your application is <strong style={{ color: "var(--accent)" }}>{verificationStatus.replace("_", " ")}</strong>.
            </p>
            <p style={{ 
              fontSize: "clamp(0.75rem, 3vw, 0.82rem)", 
              color: "var(--text-secondary)", 
              marginBottom: "clamp(1.5rem, 5vw, 2rem)" 
            }}>
              {isApproved
                ? "You can now use your provider workspace and publish services."
                : isRejected
                  ? "Please contact support or update your details before submitting again."
                  : "We'll notify you by email once approved, usually within 1-2 business days."}
            </p>
            <PrimaryBtn onClick={() => router.push("/dashboard")}>
              Go to Dashboard →
            </PrimaryBtn>
          </div>
        )}
      </div>
    </PageShell>
  );
}

// Layout helpers
function PageShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isLight = localStorage.getItem("connectmw_theme") === "light";
    const r = document.documentElement;
    r.style.setProperty("--bg-primary",    isLight ? "#f3f4f6"             : "#0d1f2d");
    r.style.setProperty("--bg-secondary",  isLight ? "#ffffff"             : "#132333");
    r.style.setProperty("--bg-elevated",   isLight ? "#f8fafc"             : "#1a2e42");
    r.style.setProperty("--text-primary",  isLight ? "#111827"             : "#ffffff");
    r.style.setProperty("--text-secondary",isLight ? "#6b7280"             : "#8ca5bc");
    r.style.setProperty("--accent",        isLight ? "#b45309"             : "#f5ab20");
    r.style.setProperty("--border",        isLight ? "rgba(0,0,0,0.08)"    : "rgba(255,255,255,0.1)");
    r.style.setProperty("--shadow",        isLight ? "rgba(15,23,42,0.12)" : "rgba(0,0,0,0.45)");
    document.body.style.background = isLight ? "#f3f4f6" : "#0d1f2d";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  return (
    <div style={{
      minHeight: "100dvh", 
      padding: "clamp(1.5rem, 5vw, 3rem) clamp(1rem, 4vw, 1.5rem)",
      fontFamily: "DM Sans, sans-serif",
    }}>
      <div style={{ 
        maxWidth: 650, 
        margin: "0 auto",
        width: "100%"
      }}>
        <div style={{ 
          fontWeight: 900, 
          fontSize: "clamp(1rem, 4vw, 1.2rem)", 
          letterSpacing: "-0.02em", 
          marginBottom: "clamp(1.5rem, 5vw, 2.5rem)", 
          color: "var(--text-primary)" 
        }}>
          Connect<span style={{ color: "var(--accent)" }}>MW</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      fontSize: "clamp(0.75rem, 3vw, 0.82rem)", 
      padding: "0.3rem 0", 
      borderBottom: "1px solid var(--border)",
      flexWrap: "wrap",
      gap: "0.5rem"
    }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}
