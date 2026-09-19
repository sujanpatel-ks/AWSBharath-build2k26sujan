import { useState } from "react";
import {
  signIn,
  signUp,
  confirmSignUp,
  resendSignUpCode,
} from "aws-amplify/auth";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Sprout } from "lucide-react";
import clsx from "clsx";

import { useAuth } from "@/store/AuthContext";

type Mode = "signin" | "signup" | "confirm";

const DEMO_MODE_ENABLED = import.meta.env.VITE_ENABLE_DEMO_MODE === "true";

export default function LoginPage() {
  const { loginAsDemo } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Sign in ─────────────────────────────────────────────
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn({ username: email.trim(), password });
      // AuthContext Hub listener will update isAuthenticated → redirect
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Sign up ─────────────────────────────────────────────
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp({
        username: email.trim(),
        password,
        options: { userAttributes: { email: email.trim(), name: name.trim() } },
      });
      setMode("confirm");
      toast.success("Verification code sent to your email");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Confirm ─────────────────────────────────────────────
  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmSignUp({ username: email.trim(), confirmationCode: code.trim() });
      toast.success("Email verified! Please sign in.");
      setMode("signin");
      setCode("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await resendSignUpCode({ username: email.trim() });
      toast.success("Code resent");
    } catch {
      toast.error("Could not resend code");
    }
  }

  const inputClass =
    "block w-full rounded-2xl border border-[#bfc9c3] bg-white px-3 py-3 text-sm text-[#191c1d] placeholder-[#707974] focus:border-[#003527] focus:outline-none focus:ring-1 focus:ring-[#003527]";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f8f9fa] px-4 py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#b0f0d6]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#fd9e70]/10 blur-3xl" />
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#003527] text-white shadow-2xl shadow-[#003527]/20">
          <Sprout className="h-11 w-11" strokeWidth={1.8} />
          <div className="absolute -inset-3 rounded-[36px] border-2 border-[#003527]/10" />
        </div>
        <h1 className="font-display text-3xl font-black tracking-tight text-[#191c1d]">AgroCare AI</h1>
        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#2b6954]">Cultivating Intelligence</p>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-[32px] border border-[#bfc9c3]/40 bg-white p-6 shadow-[0_24px_70px_rgba(0,53,39,0.10)]">
        {/* Tab switcher */}
        {mode !== "confirm" && (
          <div className="mb-6 flex rounded-2xl bg-[#edeeef] p-1">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={clsx(
                  "flex-1 rounded-xl py-2 text-sm font-bold transition-all",
                  mode === m
                    ? "bg-white text-[#003527] shadow-sm"
                    : "text-[#707974] hover:text-[#191c1d]"
                )}
              >
                {m === "signin" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>
        )}

        {/* Sign In form */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="field-label">Email address</label>
              <input type="email" required autoComplete="email" placeholder="farmer@example.com"
                className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} required autoComplete="current-password"
                  placeholder="Your password" className={inputClass + " pr-10"}
                  value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle password">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </button>
          </form>
        )}

        {/* Sign Up form */}
        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="field-label">Full name</label>
              <input type="text" required placeholder="Your name" className={inputClass}
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Email address</label>
              <input type="email" required placeholder="farmer@example.com" className={inputClass}
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Password <span className="text-gray-400 font-normal">(min 8 characters)</span></label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} required minLength={8}
                  placeholder="Choose a password" className={inputClass + " pr-10"}
                  value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label="Toggle password">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </button>
          </form>
        )}

        {/* Confirm Email form */}
        {mode === "confirm" && (
          <form onSubmit={handleConfirm} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
            <input type="text" required maxLength={6} placeholder="123456"
              className={inputClass + " text-center text-xl tracking-widest font-mono"}
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
            </button>
            <button type="button" onClick={handleResend}
              className="w-full text-sm font-bold text-[#2b6954] hover:text-[#003527]">
              Resend code
            </button>
          </form>
        )}

        {DEMO_MODE_ENABLED && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col items-center">
            <button
              type="button"
              onClick={loginAsDemo}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-sm font-semibold border border-emerald-200 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Sprout className="w-4 h-4 text-[#2b6954]" />
              Explore Demo / Preview Mode
            </button>
            <p className="text-[11px] text-gray-400 mt-1.5 text-center">
              Instant full access to Dashboard, AI Crop Scan & Advisory
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#707974]">
        AgroCare AI · Powered by Amazon Bedrock · ap-south-1
      </p>
    </div>
  );
}
