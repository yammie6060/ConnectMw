"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Sparkle, User2, Wrench, Eye, EyeOff } from "lucide-react";
import { registerUser, loginUser } from "@/lib/auth";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  businessName?: string;
  serviceMode?: string;
  companyName?: string;
  idNumber?: string;
  garageName?: string;
  businessType?: string;
}

interface AuthCardProps {
  defaultTab: View;
}

const ROLE_CONFIGS = {
  customer: {
    label: "Customer (looking for services)",
    fields: [] as RoleField[],
    icon: User2,
  },
  landlord: {
    label: "Landlord / Property Agent",
    icon: Building2,
    fields: [
      { name: "companyName", label: "Company/Agency Name", type: "text", required: true, placeholder: "MBC Property Management", colSpan: 2 },
      { name: "idNumber", label: "National ID / Registration", type: "text", required: true, placeholder: "1234567890", colSpan: 2 },
    ] as RoleField[],
  },
  beautyProvider: {
    label: "Beauty Service Provider",
    icon: Sparkle,
    fields: [
      { name: "businessName", label: "Salon/Business Name", type: "text", required: true, placeholder: "Glamour Cuts Salon", colSpan: 2 },
      { name: "serviceMode", label: "Service Mode", type: "select", required: true, options: ["Salon Only", "Mobile Only", "Both"], colSpan: 2 },
    ] as RoleField[],
  },
  spareSeller: {
    label: "Auto Spare Parts Seller",
    icon: Wrench,
    fields: [
      { name: "garageName", label: "Garage/Shop Name", type: "text", required: true, placeholder: "Toyota Spares Center", colSpan: 2 },
      { name: "businessType", label: "Business Type", type: "select", required: true, options: ["Individual Seller", "Garage", "Wholesaler", "Retailer"], colSpan: 2 },
    ] as RoleField[],
  },
} as const;

type UserRole = keyof typeof ROLE_CONFIGS;
type RoleField = {
  name: string;
  label: string;
  type: "text" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
  colSpan?: 1 | 2;
};

type View = "signin" | "signup" | "forgotPassword";

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
        className="modal-input pr-10"
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
        style={{
          position: "absolute",
          right: "0.65rem",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#8ca5bc",
          padding: "2px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export default function AuthCard({ defaultTab }: AuthCardProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>(defaultTab);
  const [signupData, setSignupData] = useState<SignupFormData>({
    firstName: "", lastName: "", email: "", phone: "", role: "", password: "",
  });
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    const isLight = localStorage.getItem("connectmw_theme") === "light";
    const root = document.documentElement;

    root.style.setProperty("--bg-primary", isLight ? "#f3f4f6" : "#0d1f2d");
    root.style.setProperty("--bg-secondary", isLight ? "#ffffff" : "#132333");
    root.style.setProperty("--bg-elevated", isLight ? "#f8fafc" : "#1a2e42");
    root.style.setProperty("--bg-muted", isLight ? "#eef2f7" : "rgba(255,255,255,0.05)");
    root.style.setProperty("--text-primary", isLight ? "#111827" : "#ffffff");
    root.style.setProperty("--text-secondary", isLight ? "#6b7280" : "#8ca5bc");
    root.style.setProperty("--text-soft", isLight ? "#334155" : "#cde0f0");
    root.style.setProperty("--accent-primary", isLight ? "#b45309" : "#f5ab20");
    root.style.setProperty("--border-color", isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)");
    root.style.setProperty("--shadow-color", isLight ? "rgba(15,23,42,0.14)" : "rgba(0,0,0,0.5)");
    document.body.style.background = isLight ? "#f3f4f6" : "#0d1f2d";
    document.body.style.color = isLight ? "#111827" : "#ffffff";
  }, []);

  const switchView = (view: View) => {
    setCurrentView(view);
    setError("");
    setSuccess("");
  };

  const handleSignupChange = (field: keyof SignupFormData, value: string) => {
    setSignupData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!signupData.role) { setError("Please select your role."); return; }

    const roleConfig = ROLE_CONFIGS[signupData.role as UserRole];
    if (roleConfig?.fields) {
      for (const field of roleConfig.fields) {
        if (field.required && !signupData[field.name as keyof SignupFormData]) {
          setError(`Please fill in ${field.label}`);
          return;
        }
      }
    }

    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));

    const result = registerUser({
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      email: signupData.email,
      phone: signupData.phone,
      role: signupData.role,
      password: signupData.password,
      businessName: signupData.businessName,
      serviceMode: signupData.serviceMode,
      companyName: signupData.companyName,
      idNumber: signupData.idNumber,
      garageName: signupData.garageName,
      businessType: signupData.businessType,
    });

    setIsSubmitting(false);
    if (!result.ok) { setError(result.error!); return; }
    setSuccess("Account created! Redirecting to your dashboard…");
    setTimeout(() => router.push("/dashboard"), 1000);
  };

  const handleSigninSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = loginUser(signinEmail, signinPassword);
    setIsSubmitting(false);
    if (!result.ok) { setError(result.error!); return; }
    setSuccess("Welcome back! Redirecting…");
    setTimeout(() => router.push("/dashboard"), 800);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setForgotSent(true);
  };

  const getRoleFields = (role: string): RoleField[] => {
    if (!role) return [];
    return ROLE_CONFIGS[role as UserRole]?.fields || [];
  };

  return (
    <>
      <style jsx global>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .modal-input {
          width: 100%;
          background: var(--bg-elevated, rgba(255,255,255,0.05));
          border: 1.5px solid var(--border-color, rgba(255,255,255,0.1));
          border-radius: 10px;
          color: var(--text-primary, white);
          padding: 0.7rem 0.95rem;
          font-family: "DM Sans", sans-serif;
          font-size: 0.88rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .modal-input:focus { border-color: var(--accent-primary, #f5ab20); background: color-mix(in srgb, var(--accent-primary, #f5ab20) 5%, var(--bg-secondary, #132333)); }
        .modal-input::placeholder { color: var(--text-secondary, #8ca5bc); }
        .modal-input option { background: var(--bg-secondary, #132333); color: var(--text-primary, white); }

        /* ── Styled error / success banners ── */
        .alert-msg {
          border-radius: 10px;
          padding: 0.65rem 1rem;
          font-size: 0.82rem;
          font-weight: 600;
          text-align: center;
          margin-bottom: 0.85rem;
        }
        .alert-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #f87171;
        }
        .alert-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
        }

        .form-grid   { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.85rem; }
        .form-grid-full { grid-column: span 2; }
        .role-badge {
          background: rgba(245,195,32,0.08);
          border: 1px solid rgba(245,195,32,0.2);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          margin-bottom: 0.85rem;
          font-size: 0.76rem;
          color: var(--accent-primary, #f5ab20);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .dynamic-fields { animation: slideIn 0.22s ease-out; }

        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; gap: 0.75rem; }
          .form-grid-full { grid-column: auto; }
        }
      `}</style>

      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent-primary, #f5ab20) 18%, transparent) 0%, transparent 65%)" }}
      />

      <div className="w-full flex justify-center items-center min-h-[calc(100dvh-180px)] px-4 py-8">
        <div
          className="relative w-full max-w-[560px] rounded-2xl overflow-y-auto"
          style={{
            background: "var(--bg-secondary, #132333)",
            border: "1px solid var(--border-color, rgba(245,166,35,0.18))",
            boxShadow: "0 24px 60px var(--shadow-color, rgba(0,0,0,0.5))",
            animation: "scaleIn 0.25s ease both",
            maxHeight: "calc(100dvh - 2rem)",
          }}
        >
          <div className="p-7 sm:p-9">
            {/* Brand */}
            <div className="font-black text-[1.3rem] sm:text-[1.5rem] mb-0.5 tracking-tight" style={{ color: "var(--text-primary, white)" }}>
              Connect<span style={{ color: "var(--accent-primary, #f5ab20)" }}>MW</span>
            </div>
            <p className="text-[0.8rem] sm:text-[0.85rem] mb-5 sm:mb-6 leading-relaxed" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
              Your all-in-one local services platform
            </p>

            {/* Tabs */}
            {(currentView === "signin" || currentView === "signup") && (
              <div className="flex mb-6" style={{ borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.08))" }}>
                {(["signin", "signup"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => switchView(v)}
                    className="flex-1 pb-3 text-center font-bold text-sm bg-transparent border-none cursor-pointer transition-all duration-200"
                    style={{
                      color: currentView === v ? "var(--accent-primary, #f5ab20)" : "var(--text-secondary, #8ca5bc)",
                      borderBottom: currentView === v ? "2px solid var(--accent-primary, #f5ab20)" : "2px solid transparent",
                      marginBottom: "-1px",
                    }}
                  >
                    {v === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>
            )}

            {/* ── SIGN IN ── */}
            {currentView === "signin" && (
              <form onSubmit={handleSigninSubmit} noValidate>
                {error   && <div className="alert-msg alert-error">{error}</div>}
                {success && <div className="alert-msg alert-success">{success}</div>}

                <FormGroup label="Email or Phone Number">
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="you@example.com or 0888 000 000"
                    value={signinEmail}
                    onChange={(e) => { setSigninEmail(e.target.value); setError(""); }}
                    required
                  />
                </FormGroup>

                <FormGroup label="Password">
                  <PasswordInput
                    placeholder="Enter your password"
                    value={signinPassword}
                    onChange={(e) => { setSigninPassword(e.target.value); setError(""); }}
                    required
                  />
                </FormGroup>

                <div className="flex justify-end mb-5 -mt-1">
                  <button
                    type="button"
                    onClick={() => switchView("forgotPassword")}
                    className="text-xs bg-transparent border-none cursor-pointer hover:underline"
                    style={{ color: "var(--accent-primary, #f5ab20)" }}
                  >
                    Forgot password?
                  </button>
                </div>

                <SubmitButton disabled={isSubmitting}>
                  {isSubmitting ? "Signing In…" : "Sign In →"}
                </SubmitButton>

                <p className="text-center mt-4 text-[0.82rem]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchView("signup")}
                    className="bg-transparent border-none cursor-pointer font-semibold hover:underline"
                    style={{ color: "var(--accent-primary, #f5ab20)" }}
                  >
                    Sign up free
                  </button>
                </p>
              </form>
            )}

            {/* ── SIGN UP ── */}
            {currentView === "signup" && (
              <form onSubmit={handleSignupSubmit} noValidate>
                {error   && <div className="alert-msg alert-error">{error}</div>}
                {success && <div className="alert-msg alert-success">{success}</div>}

                <div className="form-grid">
                  <FormGroup label="First Name">
                    <input type="text" className="modal-input" placeholder="Tawonga"
                      value={signupData.firstName}
                      onChange={(e) => handleSignupChange("firstName", e.target.value)} required />
                  </FormGroup>
                  <FormGroup label="Last Name">
                    <input type="text" className="modal-input" placeholder="Mbewe"
                      value={signupData.lastName}
                      onChange={(e) => handleSignupChange("lastName", e.target.value)} required />
                  </FormGroup>
                </div>

                <div className="form-grid">
                  <FormGroup label="Email Address">
                    <input type="email" className="modal-input" placeholder="you@example.com"
                      value={signupData.email}
                      onChange={(e) => handleSignupChange("email", e.target.value)} required />
                  </FormGroup>
                  <FormGroup label="Phone Number">
                    <input type="tel" className="modal-input" placeholder="+265 888 000 000"
                      value={signupData.phone}
                      onChange={(e) => handleSignupChange("phone", e.target.value)} required />
                  </FormGroup>
                </div>

                <div className="form-grid">
                  <FormGroup label="I want to join as">
                    <select
                      className="modal-input"
                      value={signupData.role}
                      onChange={(e) => handleSignupChange("role", e.target.value)}
                      required
                    >
                      <option value="">Select your role…</option>
                      <option value="customer">Customer (looking for services)</option>
                      <option value="landlord">🏠 Landlord / Property Agent</option>
                      <option value="beautyProvider">✨ Beauty Service Provider</option>
                      <option value="spareSeller">🔧 Auto Spare Parts Seller</option>
                    </select>
                  </FormGroup>

                  <FormGroup label="Password">
                    <PasswordInput
                      placeholder="Create a strong password"
                      value={signupData.password}
                      onChange={(e) => handleSignupChange("password", e.target.value)}
                      required
                    />
                  </FormGroup>
                </div>

                {signupData.role && getRoleFields(signupData.role).length > 0 && (
                  <div className="dynamic-fields mt-1">
                    <div className="role-badge">
                      {(() => {
                        const Icon = ROLE_CONFIGS[signupData.role as UserRole]?.icon;
                        return Icon ? <Icon size={15} strokeWidth={2} /> : null;
                      })()}
                      <span>
                        Additional info for{" "}
                        <strong>{ROLE_CONFIGS[signupData.role as UserRole]?.label}</strong>
                      </span>
                    </div>
                    <div className="form-grid">
                      {getRoleFields(signupData.role).map((field) => (
                        <div key={field.name} className={field.colSpan === 2 ? "form-grid-full" : ""}>
                          <FormGroup label={field.label}>
                            {field.type === "select" ? (
                              <select
                                className="modal-input"
                                value={signupData[field.name as keyof SignupFormData] as string || ""}
                                onChange={(e) => handleSignupChange(field.name as keyof SignupFormData, e.target.value)}
                                required={field.required}
                              >
                                <option value="">Select {field.label}…</option>
                                {field.options?.map((opt) => (
                                  <option key={opt} value={opt.toLowerCase().replace(/\s+/g, "_")}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                className="modal-input"
                                placeholder={field.placeholder}
                                value={signupData[field.name as keyof SignupFormData] as string || ""}
                                onChange={(e) => handleSignupChange(field.name as keyof SignupFormData, e.target.value)}
                                required={field.required}
                              />
                            )}
                          </FormGroup>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <SubmitButton disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account…" : "Create Account →"}
                </SubmitButton>

                <p className="text-center mt-4 text-[0.82rem]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchView("signin")}
                    className="bg-transparent border-none cursor-pointer font-semibold hover:underline"
                    style={{ color: "var(--accent-primary, #f5ab20)" }}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {currentView === "forgotPassword" && (
              <div>
                <button
                  type="button"
                  onClick={() => switchView("signin")}
                  className="flex items-center gap-1.5 text-[0.82rem] bg-transparent border-none cursor-pointer transition-colors mb-5"
                  style={{ color: "var(--text-secondary, #8ca5bc)" }}
                >
                  ← Back to Sign In
                </button>

                {!forgotSent ? (
                  <form onSubmit={handleForgotSubmit} noValidate>
                    <div className="text-center mb-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl"
                        style={{ background: "color-mix(in srgb, var(--accent-primary, #f5ab20) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--accent-primary, #f5ab20) 24%, transparent)" }}
                      >
                        🔑
                      </div>
                      <h3 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary, white)" }}>Forgot Password?</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                        Enter your email and we'll send you a reset link.
                      </p>
                    </div>

                    {error   && <div className="alert-msg alert-error">{error}</div>}
                    {success && <div className="alert-msg alert-success">{success}</div>}

                    <FormGroup label="Email Address">
                      <input
                        type="email"
                        className="modal-input"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </FormGroup>

                    <SubmitButton disabled={isSubmitting}>
                      {isSubmitting ? "Sending…" : "Send Reset Link →"}
                    </SubmitButton>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-4">📬</div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary, white)" }}>Check Your Email</h3>
                    <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
                      A reset link was sent to{" "}
                      <span className="font-semibold" style={{ color: "var(--accent-primary, #f5ab20)" }}>
                        {forgotEmail}
                      </span>
                      <br />
                      <span className="text-xs opacity-70">(Simulated — no real email in demo)</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => { setForgotSent(false); switchView("signin"); }}
                      className="text-sm font-semibold underline bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: "var(--accent-primary, #f5ab20)" }}
                    >
                      Back to Sign In
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 mb-4 flex-1">
      <label className="text-[0.76rem] font-semibold tracking-wide" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-3 rounded-full text-[0.92rem] font-bold border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      style={{ background: "var(--accent-primary, #f5ab20)", color: "#ffffff", boxShadow: "0 8px 24px color-mix(in srgb, var(--accent-primary, #f5ab20) 25%, transparent)" }}
    >
      {children}
    </button>
  );
}
