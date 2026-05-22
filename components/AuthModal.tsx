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
  type LucideProps,
} from "lucide-react";
import { ApiError } from "@/services/api";
import { authService, RegisterPayload, RegisterData } from "@/services/auth.service";
import { providerService, ProviderTypeOption } from "@/services/provider.service";

type AccountTypeOption = {
  value: string;
  label: string;
  icon: ComponentType<LucideProps>;
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

function resetDashboardLanding() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith("connectmw_dashboard_active_item:"))
    .forEach((key) => localStorage.removeItem(key));
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className="c-input pr-10"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function FormGroup({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 mb-4 flex-1">
      <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </label>
      {children}
      {helper && <span className="text-xs text-slate-500">{helper}</span>}
    </div>
  );
}

function SubmitButton({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-3 rounded-full text-sm font-bold border-none cursor-pointer
        bg-amber-500 text-white transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:bg-amber-400 active:scale-[0.98]
        flex items-center justify-center gap-2"
    >
      {children}
    </button>
  );
}

function Alert({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-center mb-4 border
        ${
          type === "error"
            ? "bg-red-500/15 border-red-500/35 text-red-400"
            : "bg-emerald-500/15 border-emerald-500/35 text-emerald-400"
        }`}
    >
      {message}
    </div>
  );
}

function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 pb-3 text-center font-bold text-sm bg-transparent border-none cursor-pointer
        transition-colors duration-200 -mb-px border-b-2
        ${
          active
            ? "text-amber-400 border-amber-400"
            : "text-slate-500 border-transparent hover:text-slate-300"
        }`}
    >
      {label}
    </button>
  );
}

function IconBox({ emoji }: { emoji: string }) {
  return (
    <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl bg-amber-500/10 border border-amber-500/25">
      {emoji}
    </div>
  );
}

function LinkButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-transparent border-none cursor-pointer text-amber-400 font-semibold p-0
        hover:underline transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AuthCard({
  defaultTab = "signin",
  onAuthenticated,
}: AuthCardProps) {
  const router = useRouter();

  const [view, setView] = useState<View>(defaultTab);
  const [accountTypes, setAccountTypes] = useState<AccountTypeOption[]>([
    CUSTOMER_OPTION,
  ]);
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
  const [pendingProviderInfo, setPendingProviderInfo] =
    useState<RegisterData | null>(null);

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState<"request" | "verify">("request");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    providerService
      .getProviderTypes()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          const dynamic: AccountTypeOption[] = res.data.map(
            (pt: ProviderTypeOption) => ({
              value: pt.name,
              label: pt.display_name,
              icon: ICON_MAP[pt.name] || User2,
            })
          );
          setAccountTypes([CUSTOMER_OPTION, ...dynamic]);
        }
      })
      .catch(() => setAccountTypes([CUSTOMER_OPTION]))
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

  // ── Handlers ────────────────────────────────────────────────────────────────

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
      resetDashboardLanding();
      onAuthenticated?.();
      setTimeout(() => {
        router.push(
          res.data?.must_change_password ? "/set-password" : "/dashboard"
        );
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
      const res = await authService.verifyEmail(
        verificationEmail.trim(),
        verificationCode.trim()
      );
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
      const res = await authService.resendVerification(
        verificationEmail.trim()
      );
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
      const res = await authService.resetPassword(
        forgotEmail.trim(),
        resetCode.trim(),
        newPassword
      );
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

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Shared input styles via a scoped global — keeps Tailwind clean */}
      <style>{`
        .c-input {
          width: 100%;
          background: rgb(26 46 66 / 0.6);
          border: 1.5px solid rgb(255 255 255 / 0.1);
          border-radius: 10px;
          color: #fff;
          padding: 0.68rem 0.9rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.18s, background 0.18s;
          box-sizing: border-box;
        }
        .c-input:focus {
          border-color: #f5ab20;
          background: rgb(245 171 32 / 0.06);
        }
        .c-input::placeholder { color: #64748b; }
        .c-input option { background: #132333; color: #fff; }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-scale-in { animation: scaleIn 0.22s ease both; }
        .animate-slide-down { animation: slideDown 0.2s ease; }
      `}</style>

      {/* Radial glow backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(245 171 32 / 0.12) 0%, transparent 62%)",
        }}
      />

      {/* Page wrapper */}
      <div className="w-full flex justify-center items-center min-h-[calc(100dvh-180px)] px-4 py-8">
        {/* Card */}
        <div
          className="animate-scale-in w-full max-w-[560px] bg-[#132333] border border-white/10
            rounded-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.5)]
            max-h-[calc(100dvh-2rem)] overflow-y-auto"
        >
          <div className="p-8 sm:p-9">
            {/* Brand */}
            <div className="font-black text-[1.4rem] tracking-tight text-white mb-1">
              Connect<span className="text-amber-400">MW</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Your all-in-one local services platform
            </p>

            {/* Tabs */}
            {(view === "signin" || view === "signup") && (
              <div className="flex border-b border-white/10 mb-6">
                <Tab
                  label="Sign In"
                  active={view === "signin"}
                  onClick={() => switchView("signin")}
                />
                <Tab
                  label="Sign Up"
                  active={view === "signup"}
                  onClick={() => switchView("signup")}
                />
              </div>
            )}

            {/* ── Sign In ── */}
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

                <div className="text-right mb-5 -mt-2">
                  <LinkButton
                    onClick={() => switchView("forgotPassword")}
                    className="text-xs text-slate-400 hover:text-amber-400"
                  >
                    Forgot password?
                  </LinkButton>
                </div>

                <SubmitButton disabled={submitting}>
                  {submitting && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  {submitting ? "Signing In…" : "Sign In →"}
                </SubmitButton>

                <p className="text-center mt-4 text-xs text-slate-400">
                  Don&apos;t have an account?{" "}
                  <LinkButton onClick={() => switchView("signup")}>
                    Sign up free
                  </LinkButton>
                </p>
              </form>
            )}

            {/* ── Sign Up ── */}
            {view === "signup" && (
              <form onSubmit={handleSignup} noValidate>
                {error && <Alert type="error" message={error} />}
                {success && <Alert type="success" message={success} />}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormGroup label="First Name">
                    <input
                      type="text"
                      className="c-input"
                      placeholder="Tawonga"
                      value={signup.first_name}
                      onChange={(e) =>
                        setSignupField("first_name", e.target.value)
                      }
                      required
                    />
                  </FormGroup>
                  <FormGroup label="Last Name">
                    <input
                      type="text"
                      className="c-input"
                      placeholder="Mbewe"
                      value={signup.last_name}
                      onChange={(e) =>
                        setSignupField("last_name", e.target.value)
                      }
                      required
                    />
                  </FormGroup>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <FormGroup
                    label="Phone Number"
                    helper="Use +265 or 0 followed by 9 digits."
                  >
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormGroup label="Account Type">
                    {typesLoading ? (
                      <div className="c-input flex items-center gap-2 text-slate-400">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Loading…</span>
                      </div>
                    ) : (
                      <select
                        className="c-input"
                        value={signup.account_type}
                        onChange={(e) =>
                          setSignupField("account_type", e.target.value)
                        }
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
                      onChange={(e) =>
                        setSignupField("password", e.target.value)
                      }
                      required
                    />
                  </FormGroup>
                </div>

                {isProvider && selectedType && (
                  <div className="animate-slide-down inline-flex items-center gap-2 mb-4
                    bg-amber-500/10 border border-amber-500/28 rounded-lg
                    px-3 py-2 text-xs text-amber-400">
                    {(() => {
                      const Icon = selectedType.icon;
                      return <Icon size={14} strokeWidth={2} />;
                    })()}
                    <span>
                      Registering as{" "}
                      <strong className="font-semibold">{selectedType.label}</strong>
                    </span>
                  </div>
                )}

                <SubmitButton disabled={submitting || typesLoading}>
                  {submitting && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  {submitting ? "Creating Account…" : "Create Account →"}
                </SubmitButton>

                <p className="text-center mt-4 text-xs text-slate-400">
                  Already have an account?{" "}
                  <LinkButton onClick={() => switchView("signin")}>
                    Sign in
                  </LinkButton>
                </p>
              </form>
            )}

            {/* ── Verify Email ── */}
            {view === "verifyEmail" && (
              <form onSubmit={handleVerifyEmail}>
                <LinkButton
                  onClick={() => switchView("signin")}
                  className="text-xs text-slate-400 mb-5 block"
                >
                  ← Back to Sign In
                </LinkButton>

                <div className="text-center mb-6">
                  <IconBox emoji="📧" />
                  <h3 className="font-bold text-lg text-white mb-1.5">
                    Check Your Email
                  </h3>
                  <p className="text-sm text-slate-400">
                    Enter the 6-digit code sent to{" "}
                    <strong className="text-white font-semibold">
                      {verificationEmail || "your email"}
                    </strong>
                    .
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
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={6}
                    inputMode="numeric"
                    required
                  />
                </FormGroup>

                <SubmitButton disabled={submitting}>
                  {submitting && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  {submitting ? "Verifying…" : "Verify Email →"}
                </SubmitButton>

                <p className="text-center mt-3 text-xs text-slate-400">
                  Didn&apos;t receive it?{" "}
                  <LinkButton
                    onClick={handleResendVerification}
                    className="text-xs"
                  >
                    Send a new code
                  </LinkButton>
                </p>
              </form>
            )}

            {/* ── Forgot Password ── */}
            {view === "forgotPassword" && (
              <div>
                <LinkButton
                  onClick={() => switchView("signin")}
                  className="text-xs text-slate-400 mb-5 block"
                >
                  ← Back to Sign In
                </LinkButton>

                {resetStep === "request" ? (
                  <form onSubmit={handleForgotPassword} noValidate>
                    <div className="text-center mb-6">
                      <IconBox emoji="🔑" />
                      <h3 className="font-bold text-lg text-white mb-1.5">
                        Forgot Password?
                      </h3>
                      <p className="text-sm text-slate-400">
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
                      {submitting && (
                        <Loader2 size={15} className="animate-spin" />
                      )}
                      {submitting ? "Sending…" : "Send Reset Code →"}
                    </SubmitButton>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} noValidate>
                    <div className="text-center mb-6">
                      <IconBox emoji="📬" />
                      <h3 className="font-bold text-lg text-white mb-1.5">
                        Reset Password
                      </h3>
                      <p className="text-sm text-slate-400">
                        Code sent to{" "}
                        <strong className="text-white font-semibold">
                          {forgotEmail}
                        </strong>
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
                      {submitting && (
                        <Loader2 size={15} className="animate-spin" />
                      )}
                      {submitting ? "Resetting…" : "Reset Password →"}
                    </SubmitButton>

                    <p className="text-center mt-3 text-xs text-slate-400">
                      <LinkButton
                        onClick={() => {
                          setResetStep("request");
                          setError("");
                          setSuccess("");
                        }}
                        className="text-xs"
                      >
                        Request a new code
                      </LinkButton>
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