import { useState } from "react";
import {
  signIn,
  signUp,
  confirmSignUp,
  resendSignUpCode,
} from "aws-amplify/auth";
import toast from "react-hot-toast";
import { Leaf, Eye, EyeOff, Loader2 } from "lucide-react";
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
    "block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-agro-500 focus:outline-none focus:ring-1 focus:ring-agro-500";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-agro-50 to-white px-4 py-12">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-agro-600 flex items-center justify-center shadow-lg mb-3">
          <Leaf className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AgroCare AI</h1>
        <p className="text-sm text-gray-500 mt-1">Agricultural intelligence for every farmer</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md ring-1 ring-gray-100 p-6">
        {/* Tab switcher */}
        {mode !== "confirm" && (
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={clsx(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                  mode === m
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
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
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
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
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
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
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
            </button>
            <button type="button" onClick={handleResend}
              className="w-full text-sm text-agro-600 hover:text-agro-700 font-medium">
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
              <Leaf className="w-4 h-4 text-emerald-600" />
              Explore Demo / Preview Mode
            </button>
            <p className="text-[11px] text-gray-400 mt-1.5 text-center">
              Instant full access to Dashboard, AI Crop Scan & Advisory
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        AgroCare AI · Powered by Amazon Bedrock · ap-south-1
      </p>
    </div>
  );
}
