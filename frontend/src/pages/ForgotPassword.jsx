import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Mail, ShieldCheck, Lock } from "lucide-react";
import { Backdrop, Card, Input, Logo, Spinner } from "../components/ui/Shared";
import { apiError, forgotRequest, forgotReset, forgotVerifyCode } from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState("request"); // request | verify | reset
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRequest(e) {
    e.preventDefault();
    setError("");
    if (!email) return setError("Enter your email.");
    setLoading(true);
    try {
      await forgotRequest(email);
      toast.success("Code sent — check your inbox.");
      setStep("verify");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    if (code.trim().length !== 6) return setError("Enter the 6-digit code.");
    setLoading(true);
    try {
      await forgotVerifyCode(email, code.trim());
      setStep("reset");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await forgotReset(email, code.trim(), newPassword);
      toast.success("Password updated — please sign in.");
      navigate("/login");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { key: "request", label: "Email" },
    { key: "verify", label: "Code" },
    { key: "reset", label: "New password" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <Backdrop />
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="p-8">
          <div className="mb-6 flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                    i <= stepIndex
                      ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white"
                      : "bg-white/5 text-zinc-500"
                  }`}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-px w-8 ${i < stepIndex ? "bg-violet-500" : "bg-white/10"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {step === "request" && (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
                  <KeyRound className="h-6 w-6 text-violet-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
                <p className="mt-1.5 text-sm text-zinc-400">
                  Enter your email and we'll send you a reset code.
                </p>
              </div>
              <form onSubmit={handleRequest} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  rightSlot={<Mail className="h-4 w-4 text-zinc-500" />}
                />
                {error && (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all disabled:opacity-60"
                >
                  {loading ? <Spinner className="h-4 w-4" /> : "Send reset code"}
                </button>
              </form>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
                  <ShieldCheck className="h-6 w-6 text-violet-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Enter the code</h1>
                <p className="mt-1.5 text-sm text-zinc-400">
                  Sent to <span className="font-medium text-zinc-300">{email}</span>
                </p>
              </div>
              <form onSubmit={handleVerify} className="space-y-4">
                <Input
                  label="Verification code"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  className="text-center text-lg tracking-[0.5em]"
                />
                {error && (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all disabled:opacity-60"
                >
                  {loading ? <Spinner className="h-4 w-4" /> : "Verify code"}
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
                  <Lock className="h-6 w-6 text-violet-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Set a new password</h1>
                <p className="mt-1.5 text-sm text-zinc-400">
                  Choose a strong password for your account.
                </p>
              </div>
              <form onSubmit={handleReset} className="space-y-4">
                <Input
                  label="New password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {error && (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all disabled:opacity-60"
                >
                  {loading ? <Spinner className="h-4 w-4" /> : "Reset password"}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-zinc-500">
            Remembered it?{" "}
            <Link to="/login" className="font-medium text-violet-400 hover:text-violet-300">
              Back to sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
