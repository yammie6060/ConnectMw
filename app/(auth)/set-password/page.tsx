"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { getSession } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react"; 

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const session = getSession();

  useEffect(() => {
    if (!session) router.replace("/signin");
    else if (!session.mustChangePassword) router.replace("/dashboard");
  }, [router, session]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!session?.id) return setError("Please sign in again.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      await authService.setNewPassword(session.id, password, confirm);
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen py-5 flex items-center justify-center px-4 bg-[#0d1f2d] text-white">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl p-6 bg-[#132333] border border-white/10">
        <h1 className="text-2xl font-black mb-2">Set New Password</h1>
        <p className="text-sm mb-5 text-[#8ca5bc]">Your temporary staff password must be changed before using the dashboard.</p>
        
        <label className="block text-xs font-bold mb-1 text-[#8ca5bc]">New Password</label>
        <div className="relative mb-3">
          <input 
            type={showPassword ? "text" : "password"} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full rounded-xl px-3 py-2 outline-none pr-10 bg-[#1a2e42] border border-white/10 text-white" 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ca5bc] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <label className="block text-xs font-bold mb-1 text-[#8ca5bc]">Confirm Password</label>
        <div className="relative mb-4">
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            value={confirm} 
            onChange={(e) => setConfirm(e.target.value)} 
            className="w-full rounded-xl px-3 py-2 outline-none pr-10 bg-[#1a2e42] border border-white/10 text-white" 
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ca5bc] hover:text-white transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        {error && <div className="text-xs font-semibold mb-3 text-red-500">{error}</div>}
        <button 
          disabled={submitting} 
          className="w-full rounded-xl py-3 font-black disabled:opacity-60 bg-[#f5ab20] text-[#0d1f2d] hover:bg-[#e8941a] transition-colors"
        >
          {submitting ? "Saving..." : "Change Password"}
        </button>
      </form>
    </main>
  );
}