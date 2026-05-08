"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Sparkle, User2, Wrench } from "lucide-react";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  // Role-specific fields
  businessName?: string;
  serviceMode?: string;
  companyName?: string;
  idNumber?: string;
  garageName?: string;
  businessType?: string;
}

interface AuthCardProps {
  defaultTab: "signin" | "signup" | "forgotPassword";
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

type View = "signin" | "signup" | "forgotPassword" | "resetPassword";

export default function AuthCard({ defaultTab }: AuthCardProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>(defaultTab);
  const [signupData, setSignupData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState<"request" | "verify">("request");

  const switchView = (view: View) => {
    setCurrentView(view);
    setError("");
    setSuccess("");
    // Update URL without page reload
    const url = view === "signin" ? "/signin" : view === "signup" ? "/signup" : "/forgot-password";
    router.replace(url);
  };

  const handleSignupChange = (field: keyof SignupFormData, value: string) => {
    setSignupData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const selectedRole = signupData.role as UserRole;
    const roleConfig = ROLE_CONFIGS[selectedRole];

    if (roleConfig && roleConfig.fields) {
      for (const field of roleConfig.fields) {
        if (field.required && !signupData[field.name as keyof SignupFormData]) {
          setError(`Please fill in ${field.label}`);
          setIsSubmitting(false);
          return;
        }
      }
    }

    // Submit logic...
    console.log("Submitting:", signupData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
  };

  const handleSigninSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    // Sign in logic...
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // API call to request password reset
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Request failed");

      setSuccess("Password reset code sent to your email!");
      setResetStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          code: resetCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Reset failed");

      setSuccess("Password reset successful! Please sign in.");
      setTimeout(() => {
        switchView("signin");
        setForgotEmail("");
        setResetCode("");
        setNewPassword("");
        setConfirmPassword("");
        setResetStep("request");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleFields = (role: string): RoleField[] => {
    if (!role) return [];
    const config = ROLE_CONFIGS[role as UserRole];
    return config?.fields || [];
  };

  return (
    <>
      <style jsx global>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.93); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .modal-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: white;
          padding: 0.55rem 0.8rem;
          font-family: "DM Sans", sans-serif;
          font-size: 0.84rem;
          outline: none;
          transition: all 0.2s;
        }
        .modal-input:focus { border-color: #f5ab20; background: rgba(255,255,255,0.08); }
        .modal-input::placeholder { color: #8ca5bc; }
        .modal-input option { background: #132333; }
        .error-message {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.5rem;
          text-align: center;
        }
        .success-message {
          color: #10b981;
          font-size: 0.75rem;
          margin-top: 0.5rem;
          text-align: center;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .form-grid-full {
          grid-column: span 2;
        }
        .role-badge {
          background: rgba(245, 195, 32, 0.1);
          border: 1px solid rgba(245, 195, 32, 0.2);
          border-radius: 8px;
          padding: 0.45rem 0.65rem;
          margin-bottom: 0.75rem;
          font-size: 0.76rem;
          color: #f5ab20;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .dynamic-fields {
          animation: slideIn 0.25s ease-out;
        }
        .back-link {
          background: none;
          border: none;
          color: #8ca5bc;
          cursor: pointer;
          font-size: 0.82rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #f5ab20;
        }
        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .form-grid-full {
            grid-column: auto;
          }
        }
      `}</style>

      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse at center, rgba(27,79,106,.4) 0%, transparent 65%)",
        }}
      />

      <div
        className="relative w-full max-w-[600px] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[14px] p-5 sm:p-6"
        style={{
          background: "#132333",
          border: "1px solid rgba(245,166,35,0.2)",
          animation: "scaleIn 0.25s ease both",
        }}
      >
        <div
          className="font-black text-[1.15rem] mb-1 text-white"
          style={{ fontFamily: " sans-serif" }}
        >
          Connect<span style={{ color: "#f5ab20" }}>MW</span>
        </div>
        <p className="text-[0.78rem] text-[#8ca5bc] mb-4">
          Your all-in-one local services platform
        </p>

        {/* Show tabs only for signin/signup, not for forgot password */}
        {(currentView === "signin" || currentView === "signup") && (
          <div className="flex mb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {(["signin", "signup"] as const).map((view) => (
              <button
                key={view}
                onClick={() => switchView(view)}
                className="flex-1 py-2 text-center font-bold text-sm bg-transparent border-none cursor-pointer transition-all duration-200"
                style={{
                  fontFamily: " sans-serif",
                  color: currentView === view ? "#f5ab20" : "#8ca5bc",
                  borderBottom: currentView === view ? "2px solid #f5ab20" : "2px solid transparent",
                }}
              >
                {view === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        {/* SIGN IN VIEW */}
        {currentView === "signin" && (
          <form onSubmit={handleSigninSubmit}>
            <FormGroup label="Email or Phone Number">
              <ModalInput type="text" placeholder="you@example.com or 0888..." />
            </FormGroup>
            <FormGroup label="Password">
              <ModalInput type="password" placeholder="Enter your password" />
            </FormGroup>
            <div className="text-right mb-5">
              <button
                type="button"
                onClick={() => switchView("forgotPassword")}
                className="text-xs no-underline hover:underline bg-transparent border-none cursor-pointer"
                style={{ color: "#f5ab20" }}
              >
                Forgot password?
              </button>
            </div>
            <SubmitButton disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In →"}
            </SubmitButton>
            <p className="text-center mt-3 text-[0.8rem] text-[#8ca5bc]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchView("signup")}
                className="bg-transparent border-none cursor-pointer text-[0.82rem] hover:underline"
                style={{ color: "#f5ab20" }}
              >
                Sign up free
              </button>
            </p>
          </form>
        )}

        {/* SIGN UP VIEW */}
        {currentView === "signup" && (
          <form onSubmit={handleSignupSubmit}>
            <div className="form-grid">
              <FormGroup label="First Name">
                <ModalInput
                  type="text"
                  placeholder="Tawonga"
                  value={signupData.firstName}
                  onChange={(e) => handleSignupChange("firstName", e.target.value)}
                  required
                />
              </FormGroup>
              <FormGroup label="Last Name">
                <ModalInput
                  type="text"
                  placeholder="Mbewe"
                  value={signupData.lastName}
                  onChange={(e) => handleSignupChange("lastName", e.target.value)}
                  required
                />
              </FormGroup>
            </div>

            <div className="form-grid">
              <FormGroup label="Email Address">
                <ModalInput
                  type="email"
                  placeholder="you@example.com"
                  value={signupData.email}
                  onChange={(e) => handleSignupChange("email", e.target.value)}
                  required
                />
              </FormGroup>
              <FormGroup label="Phone Number">
                <ModalInput
                  type="tel"
                  placeholder="+265 888 000 000"
                  value={signupData.phone}
                  onChange={(e) => handleSignupChange("phone", e.target.value)}
                  required
                />
              </FormGroup>
            </div>

            <div className="form-grid">
              <FormGroup label="I want to join as">
                <ModalSelect
                  value={signupData.role}
                  onChange={(e) => handleSignupChange("role", e.target.value)}
                  options={[
                    { value: "", label: "Select your role..." },
                    { value: "customer", label: "Customer (looking for services)" },
                    { value: "landlord", label: " Landlord / Property Agent" },
                    { value: "beautyProvider", label: " Beauty Service Provider" },
                    { value: "spareSeller", label: "Auto Spare Parts Seller" },
                  ]}
                />
              </FormGroup>
              
              <FormGroup label="Password">
                <ModalInput
                  type="password"
                  placeholder="Create a strong password"
                  value={signupData.password}
                  onChange={(e) => handleSignupChange("password", e.target.value)}
                  required
                />
              </FormGroup>
            </div>

            {signupData.role && getRoleFields(signupData.role).length > 0 && (
              <div className="dynamic-fields">
                <div className="role-badge">
                  {(() => {
                    const IconComponent = ROLE_CONFIGS[signupData.role as UserRole]?.icon;
                    return IconComponent ? <IconComponent size={18} strokeWidth={2} /> : null;
                  })()}
                  <span>Additional information for {ROLE_CONFIGS[signupData.role as UserRole]?.label}</span>
                </div>
                <div className="form-grid">
                  {getRoleFields(signupData.role).map((field) => (
                    <div key={field.name} className={field.colSpan === 2 ? "form-grid-full" : ""}>
                      <FormGroup label={field.label}>
                        {field.type === "select" ? (
                          <ModalSelect
                            value={signupData[field.name as keyof SignupFormData] as string || ""}
                            onChange={(e) => handleSignupChange(field.name as keyof SignupFormData, e.target.value)}
                            options={[
                              { value: "", label: field.placeholder || `Select ${field.label}...` },
                              ...(field.options?.map(opt => ({ value: opt.toLowerCase().replace(/\s+/g, "_"), label: opt })) || [])
                            ]}
                            required={field.required}
                          />
                        ) : (
                          <ModalInput
                            type={field.type}
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

            {error && <div className="error-message">{error}</div>}

            <SubmitButton disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account →"}
            </SubmitButton>

            <p className="text-center mt-3 text-[0.8rem] text-[#8ca5bc]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchView("signin")}
                className="bg-transparent border-none cursor-pointer text-[0.82rem] hover:underline"
                style={{ color: "#f5ab20" }}
              >
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {currentView === "forgotPassword" && (
          <div>
            <button
              type="button"
              onClick={() => switchView("signin")}
              className="back-link mb-4"
            >
              ← Back to Sign In
            </button>

            {resetStep === "request" ? (
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="text-center mb-5">
                  <div className="text-4xl mb-3">
                  </div>
                  <h3 className="text-white font-semibold mb-2">Forgot Password?</h3>
                  <p className="text-[#8ca5bc] text-sm">
                    Enter your email address and we'll send you a code to reset your password.
                  </p>
                </div>

                <FormGroup label="Email Address">
                  <ModalInput
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </FormGroup>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <SubmitButton disabled={isSubmitting}>
                  {isSubmitting ? "Sending Code..." : "Send Reset Code →"}
                </SubmitButton>

                <p className="text-center mt-3 text-[0.8rem] text-[#8ca5bc]">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => switchView("signin")}
                    className="bg-transparent border-none cursor-pointer text-[0.82rem] hover:underline"
                    style={{ color: "#f5ab20" }}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="text-center mb-5">
                  <h3 className="text-white font-semibold mb-2">Check Your Email</h3>
                  <p className="text-[#8ca5bc] text-sm">
                    We sent a 6-digit code to {forgotEmail}
                  </p>
                </div>

                <FormGroup label="Reset Code">
                  <ModalInput
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup label="New Password">
                  <ModalInput
                    type="password"
                    placeholder="Create new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup label="Confirm New Password">
                  <ModalInput
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </FormGroup>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <SubmitButton disabled={isSubmitting}>
                  {isSubmitting ? "Resetting..." : "Reset Password →"}
                </SubmitButton>

                <p className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep("request");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-[#8ca5bc] text-sm hover:text-[#f5ab20] transition-colors bg-transparent border-none cursor-pointer"
                  >
                    ← Didn't receive code? Try again
                  </button>
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Helper Components
function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 mb-3 flex-1">
      <label className="text-[0.74rem] font-medium text-[#8ca5bc]">{label}</label>
      {children}
    </div>
  );
}

function ModalInput({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  required 
}: { 
  type: string; 
  placeholder?: string; 
  value?: string; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder || ""}
      className="modal-input"
      value={value}
      onChange={onChange}
      required={required}
    />
  );
}

function ModalSelect({ 
  value, 
  onChange, 
  options, 
  required 
}: { 
  value?: string; 
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; 
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <select className="modal-input" value={value} onChange={onChange} required={required}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-2.5 rounded-full text-[0.9rem] font-bold text-[#0d1f2d] bg-[#f5ab20] border-none cursor-pointer transition-all duration-200 hover:bg-[#e8941a] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(245,166,35,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}
