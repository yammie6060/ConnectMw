"use client";

import { useEffect, useState, useCallback } from "react";
import type { ComponentType, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  BriefcaseBusiness,
  Sparkles,
  User2,
  Wrench,
  Eye,
  EyeOff,
  Loader2,
  type LucideProps,  // Import LucideProps type
} from "lucide-react";
import { ApiError } from "@/services/api";
import { authService, RegisterPayload, RegisterData } from "@/services/auth.service";
import { providerService, ProviderTypeOption } from "@/services/provider.service";


type AccountTypeOption = {
  value: string;         
  label: string;
  icon: ComponentType<LucideProps>;  // Use LucideProps instead of custom type
};

type View = "signin" | "signup" | "forgotPassword" | "verifyEmail";

type SignupFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  account_type: string;
};

interface AuthCardProps {
  defaultTab?: "signin" | "signup" | "forgotPassword";
  onAuthenticated?: () => void;
}

// Fix: Use LucideProps for the icon type
const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  customer: User2,
  spare_seller: Wrench,
  beauty_provider: Sparkles,
  landlord: Building2,
  agent: BriefcaseBusiness,
};

const CUSTOMER_OPTION: AccountTypeOption = {
  value: "customer",
  label: "Customer",
  icon: User2,
};

const PASSWORD_HELPER = "At least 8 characters with one letter and one number.";

function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError || err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

function applyTheme() {
  const isLight = localStorage.getItem("connectmw_theme") === "light";
  const r = document.documentElement;
  r.style.setProperty("--bg-primary", isLight ? "#f3f4f6" : "#0d1f2d");
  r.style.setProperty("--bg-secondary", isLight ? "#ffffff" : "#132333");
  r.style.setProperty("--bg-elevated", isLight ? "#f8fafc" : "#1a2e42");
  r.style.setProperty("--bg-muted", isLight ? "#eef2f7" : "rgba(255,255,255,0.05)");
  r.style.setProperty("--text-primary", isLight ? "#111827" : "#ffffff");
  r.style.setProperty("--text-secondary", isLight ? "#6b7280" : "#8ca5bc");
  r.style.setProperty("--text-soft", isLight ? "#334155" : "#cde0f0");
  r.style.setProperty("--accent", isLight ? "#b45309" : "#f5ab20");
  r.style.setProperty("--border", isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)");
  r.style.setProperty("--shadow", isLight ? "rgba(15,23,42,0.14)" : "rgba(0,0,0,0.5)");
  document.body.style.background = isLight ? "#f3f4f6" : "#0d1f2d";
  document.body.style.color = isLight ? "#111827" : "#ffffff";
}

function PasswordInput({
  placeholder,
  value,
  onChange,
  required,
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        className="c-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{ paddingRight: "2.5rem" }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
        style={{
          position: "absolute",
          right: "0.7rem",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-secondary)",
          padding: 0,
          display: "flex",
        }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function FormGroup({ label, helper, children }: { label: string; helper?: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "1rem", flex: 1 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
        {label}
      </label>
      {children}
      {helper && <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{helper}</span>}
    </div>
  );
}

function SubmitButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      style={{
        width: "100%",
        padding: "0.75rem",
        borderRadius: 999,
        fontSize: "0.92rem",
        fontWeight: 700,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: "var(--accent)",
        color: "#fff",
        opacity: disabled ? 0.55 : 1,
        transition: "transform 0.15s, opacity 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
    >
      {children}
    </button>
  );
}

function Alert({ type, message }: { type: "error" | "success"; message: string }) {
  return (
    <div
      style={{
        borderRadius: 10,
        padding: "0.65rem 1rem",
        fontSize: "0.82rem",
        fontWeight: 600,
        textAlign: "center",
        marginBottom: "0.85rem",
        background: type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
        border: `1px solid ${type === "error" ? "rgba(239,68,68,0.35)" : "rgba(16,185,129,0.35)"}`,
        color: type === "error" ? "#f87171" : "#34d399",
      }}
    >
      {message}
    </div>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        paddingBottom: "0.75rem",
        textAlign: "center",
        fontWeight: 700,
        fontSize: "0.88rem",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: active ? "var(--accent)" : "var(--text-secondary)",
        borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
        marginBottom: "-1px",
        transition: "color 0.2s",
      }}
    >
      {label}
    </button>
  );
}

export default function AuthCard({ defaultTab = "signin", onAuthenticated }: AuthCardProps) {
  const router = useRouter();

  const [view, setView] = useState<View>(defaultTab);
  const [accountTypes, setAccountTypes] = useState<AccountTypeOption[]>([CUSTOMER_OPTION]);
  const [typesLoading, setTypesLoading] = useState(true);

  const [signup, setSignup] = useState<SignupFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    account_type: "customer",
  });
  const [signin, setSignin] = useState({ email: "", password: "" });

  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingProviderInfo, setPendingProviderInfo] = useState<RegisterData | null>(null);

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState<"request" | "verify">("request");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    applyTheme();
  }, []);

  useEffect(() => {
    providerService
      .getProviderTypes()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          const dynamic: AccountTypeOption[] = res.data.map((pt: ProviderTypeOption) => ({
            value: pt.name,
            label: pt.display_name,
            icon: ICON_MAP[pt.name] || User2,
          }));
          setAccountTypes([CUSTOMER_OPTION, ...dynamic]);
        }
      })
      .catch(() => {
        setAccountTypes([CUSTOMER_OPTION]);
      })
      .finally(() => setTypesLoading(false));
  }, []);

  const switchView = useCallback((v: View) => {
    setView(v);
    setError("");
    setSuccess("");
  }, []);

  const setSignupField = (field: keyof SignupFormData, value: string) => {
    setSignup((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const isProvider = signup.account_type !== "customer";
  const selectedType = accountTypes.find((t) => t.value === signup.account_type);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (signup.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload: RegisterPayload = {
      email: signup.email.trim(),
      phone: signup.phone.trim(),
      password: signup.password,
      full_name: `${signup.first_name.trim()} ${signup.last_name.trim()}`.trim(),
      register_as_provider: isProvider,
      provider_type: isProvider ? signup.account_type : null,
    };

    try {
      const res = await authService.register(payload);
      setPendingProviderInfo(res.data ?? null);
      setVerificationEmail(payload.email);
      setSuccess(res.message);
      switchView("verifyEmail");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignin = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await authService.login({
        email: signin.email.trim(),
        password: signin.password,
      });
      setSuccess("Welcome back! Redirecting…");
      onAuthenticated?.();
      setTimeout(() => {
        router.push(res.data?.must_change_password ? "/set-password" : "/dashboard");
        router.refresh();
      }, 700);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setVerificationEmail(signin.email.trim());
        switchView("verifyEmail");
      }
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmail = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await authService.verifyEmail(verificationEmail.trim(), verificationCode.trim());
      setSuccess(res.message);
      setVerificationCode("");

      setTimeout(() => {
        const providerId =
          pendingProviderInfo?.provider_info?.provider_id ??
          res.data?.user.providers?.[0]?.id;

        if (providerId) {
          router.push(`/dashboard/provider-setup/${providerId}`);
        } else {
          onAuthenticated?.();
          router.push("/dashboard");
        }
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await authService.resendVerification(verificationEmail.trim());
      setSuccess(res.message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await authService.forgotPassword(forgotEmail.trim());
      setSuccess(res.message);
      setResetStep("verify");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await authService.resetPassword(forgotEmail.trim(), resetCode.trim(), newPassword);
      setSuccess(res.message);
      setTimeout(() => {
        setResetStep("request");
        switchView("signin");
      }, 1400);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .c-input {
          width: 100%;
          background: var(--bg-elevated);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          color: var(--text-primary);
          padding: 0.68rem 0.9rem;
          font-size: 0.875rem;
          font-family: "DM Sans", sans-serif;
          outline: none;
          transition: border-color 0.18s, background 0.18s;
          box-sizing: border-box;
        }
        .c-input:focus {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 5%, var(--bg-secondary));
        }
        .c-input::placeholder {
          color: var(--text-secondary);
        }
        .c-input option {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }
        @media (max-width: 520px) {
          .grid2 {
            grid-template-columns: 1fr;
            gap: 0.7rem;
          }
        }
        .provider-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: color-mix(in srgb, var(--accent) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
          border-radius: 8px;
          padding: 0.45rem 0.75rem;
          font-size: 0.76rem;
          color: var(--accent);
          margin-bottom: 1rem;
          animation: slideDown 0.2s ease;
        }
        .link-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--accent);
          font-weight: 600;
          font-size: inherit;
          padding: 0;
          text-decoration: none;
        }
        .link-btn:hover {
          text-decoration: underline;
        }
      `}</style>

      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 16%, transparent) 0%, transparent 62%)",
        }}
      />

      <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100dvh - 180px)", padding: "2rem 1rem" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            boxShadow: "0 24px 60px var(--shadow)",
            animation: "scaleIn 0.22s ease both",
            maxHeight: "calc(100dvh - 2rem)",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "2rem 2.25rem" }}>
            <div style={{ fontWeight: 900, fontSize: "1.4rem", letterSpacing: "-0.02em", marginBottom: "0.2rem", color: "var(--text-primary)" }}>
              Connect<span style={{ color: "var(--accent)" }}>MW</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Your all-in-one local services platform
            </p>

            {(view === "signin" || view === "signup") && (
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem" }}>
                <Tab label="Sign In" active={view === "signin"} onClick={() => switchView("signin")} />
                <Tab label="Sign Up" active={view === "signup"} onClick={() => switchView("signup")} />
              </div>
            )}

            {view === "signin" && (
              <form onSubmit={handleSignin} noValidate>
                {error && <Alert type="error" message={error} />}
                {success && <Alert type="success" message={success} />}

                <FormGroup label="Email or Phone">
                  <input
                    type="text"
                    className="c-input"
                    placeholder="you@example.com or 0888 000 000"
                    value={signin.email}
                    onChange={(e) => {
                      setSignin((p) => ({ ...p, email: e.target.value }));
                      setError("");
                    }}
                    required
                  />
                </FormGroup>

                <FormGroup label="Password">
                  <PasswordInput
                    placeholder="Enter your password"
                    value={signin.password}
                    onChange={(e) => {
                      setSignin((p) => ({ ...p, password: e.target.value }));
                      setError("");
                    }}
                    required
                  />
                </FormGroup>

                <div style={{ textAlign: "right", marginBottom: "1.25rem", marginTop: "-0.5rem" }}>
                  <button type="button" className="link-btn" style={{ fontSize: "0.8rem" }} onClick={() => switchView("forgotPassword")}>
                    Forgot password?
                  </button>
                </div>

                <SubmitButton disabled={submitting}>
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {submitting ? "Signing In…" : "Sign In →"}
                </SubmitButton>

                <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  Don&apos;t have an account?{" "}
                  <button type="button" className="link-btn" onClick={() => switchView("signup")}>
                    Sign up free
                  </button>
                </p>
              </form>
            )}

            {view === "signup" && (
              <form onSubmit={handleSignup} noValidate>
                {error && <Alert type="error" message={error} />}
                {success && <Alert type="success" message={success} />}

                <div className="grid2">
                  <FormGroup label="First Name">
                    <input
                      type="text"
                      className="c-input"
                      placeholder="Tawonga"
                      value={signup.first_name}
                      onChange={(e) => setSignupField("first_name", e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup label="Last Name">
                    <input
                      type="text"
                      className="c-input"
                      placeholder="Mbewe"
                      value={signup.last_name}
                      onChange={(e) => setSignupField("last_name", e.target.value)}
                      required
                    />
                  </FormGroup>
                </div>

                <div className="grid2">
                  <FormGroup label="Email Address">
                    <input
                      type="email"
                      className="c-input"
                      placeholder="you@example.com"
                      value={signup.email}
                      onChange={(e) => setSignupField("email", e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup label="Phone Number" helper="Use +265 or 0 followed by 9 digits.">
                    <input
                      type="tel"
                      className="c-input"
                      placeholder="+265 888 000 000"
                      value={signup.phone}
                      onChange={(e) => setSignupField("phone", e.target.value)}
                      required
                    />
                  </FormGroup>
                </div>

                <div className="grid2">
                  <FormGroup label="Account Type">
                    {typesLoading ? (
                      <div className="c-input" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Loading…</span>
                      </div>
                    ) : (
                      <select
                        className="c-input"
                        value={signup.account_type}
                        onChange={(e) => setSignupField("account_type", e.target.value)}
                        required
                      >
                        {accountTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </FormGroup>

                  <FormGroup label="Password" helper={PASSWORD_HELPER}>
                    <PasswordInput
                      placeholder="Create a strong password"
                      value={signup.password}
                      onChange={(e) => setSignupField("password", e.target.value)}
                      required
                    />
                  </FormGroup>
                </div>

                {isProvider && selectedType && (
                  <div className="provider-badge">
                    {(() => {
                      const Icon = selectedType.icon;
                      return <Icon size={14} strokeWidth={2} />;
                    })()}
                    <span>
                      Registering as <strong>{selectedType.label}</strong>
                    </span>
                  </div>
                )}

                <SubmitButton disabled={submitting || typesLoading}>
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {submitting ? "Creating Account…" : "Create Account →"}
                </SubmitButton>

                <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  Already have an account?{" "}
                  <button type="button" className="link-btn" onClick={() => switchView("signin")}>
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {view === "verifyEmail" && (
              <form onSubmit={handleVerifyEmail}>
                <button
                  type="button"
                  className="link-btn"
                  style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1.25rem", display: "block" }}
                  onClick={() => switchView("signin")}
                >
                  ← Back to Sign In
                </button>

                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      margin: "0 auto 0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.6rem",
                      background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--accent) 24%, transparent)",
                    }}
                  >
                    📧
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                    Check Your Email
                  </h3>
                  <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                    Enter the 6-digit code sent to <strong>{verificationEmail || "your email"}</strong>.
                  </p>
                </div>

                {error && <Alert type="error" message={error} />}
                {success && <Alert type="success" message={success} />}

                <FormGroup label="Email Address">
                  <input
                    type="email"
                    className="c-input"
                    placeholder="you@example.com"
                    value={verificationEmail}
                    onChange={(e) => setVerificationEmail(e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup label="Verification Code">
                  <input
                    type="text"
                    className="c-input"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    inputMode="numeric"
                    required
                  />
                </FormGroup>

                <SubmitButton disabled={submitting}>
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {submitting ? "Verifying…" : "Verify Email →"}
                </SubmitButton>

                <p style={{ textAlign: "center", marginTop: "0.85rem", fontSize: "0.8rem" }}>
                  Didn&apos;t receive it?{" "}
                  <button type="button" className="link-btn" style={{ fontSize: "0.8rem" }} onClick={handleResendVerification}>
                    Send a new code
                  </button>
                </p>
              </form>
            )}

            {view === "forgotPassword" && (
              <div>
                <button
                  type="button"
                  className="link-btn"
                  style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1.25rem", display: "block" }}
                  onClick={() => switchView("signin")}
                >
                  ← Back to Sign In
                </button>

                {resetStep === "request" ? (
                  <form onSubmit={handleForgotPassword} noValidate>
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 14,
                          margin: "0 auto 0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.6rem",
                          background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                          border: "1px solid color-mix(in srgb, var(--accent) 24%, transparent)",
                        }}
                      >
                        🔑
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                        Forgot Password?
                      </h3>
                      <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                        Enter your email and we&apos;ll send a reset code.
                      </p>
                    </div>

                    {error && <Alert type="error" message={error} />}
                    {success && <Alert type="success" message={success} />}

                    <FormGroup label="Email Address">
                      <input
                        type="email"
                        className="c-input"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setError("");
                        }}
                        required
                      />
                    </FormGroup>

                    <SubmitButton disabled={submitting}>
                      {submitting && <Loader2 size={15} className="animate-spin" />}
                      {submitting ? "Sending…" : "Send Reset Code →"}
                    </SubmitButton>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} noValidate>
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 14,
                          margin: "0 auto 0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.6rem",
                          background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                          border: "1px solid color-mix(in srgb, var(--accent) 24%, transparent)",
                        }}
                      >
                        📬
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                        Reset Password
                      </h3>
                      <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                        Code sent to <strong>{forgotEmail}</strong>
                      </p>
                    </div>

                    {error && <Alert type="error" message={error} />}
                    {success && <Alert type="success" message={success} />}

                    <FormGroup label="Reset Code">
                      <input
                        type="text"
                        className="c-input"
                        placeholder="Enter 6-digit code"
                        value={resetCode}
                        onChange={(e) => {
                          setResetCode(e.target.value.replace(/\D/g, ""));
                          setError("");
                        }}
                        maxLength={6}
                        inputMode="numeric"
                        required
                      />
                    </FormGroup>

                    <FormGroup label="New Password" helper={PASSWORD_HELPER}>
                      <PasswordInput
                        placeholder="Create new password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError("");
                        }}
                        required
                      />
                    </FormGroup>

                    <FormGroup label="Confirm New Password">
                      <PasswordInput
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                        required
                      />
                    </FormGroup>

                    <SubmitButton disabled={submitting}>
                      {submitting && <Loader2 size={15} className="animate-spin" />}
                      {submitting ? "Resetting…" : "Reset Password →"}
                    </SubmitButton>

                    <p style={{ textAlign: "center", marginTop: "0.85rem", fontSize: "0.8rem" }}>
                      <button
                        type="button"
                        className="link-btn"
                        style={{ fontSize: "0.8rem" }}
                        onClick={() => {
                          setResetStep("request");
                          setError("");
                          setSuccess("");
                        }}
                      >
                        Request a new code
                      </button>
                    </p>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
