import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Backdrop, Card, Input, Logo, Spinner } from "../components/ui/Shared";
import { apiError, registerResend, registerVerify } from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    if (!email) return setError("Enter your email.");
    if (code.trim().length !== 6) return setError("Enter the 6-digit code.");
    setLoading(true);
    try {
      await registerVerify(email, code.trim());
      toast.success("Email verified — you can now sign in.");
      navigate("/login");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return setError("Enter your email first.");
    setResending(true);
    setError("");
    try {
      await registerResend(email);
      toast.info("A new code is on its way.");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <Backdrop />
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
              <ShieldCheck className="h-6 w-6 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verify your email</h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Enter the 6-digit code we sent you to activate your account.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:shadow-violet-700/40 disabled:opacity-60"
            >
              {loading ? <Spinner className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              Verify & continue
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Didn't get a code?{" "}
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-medium text-violet-400 hover:text-violet-300 disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          </p>
          <p className="mt-2 text-center text-sm text-zinc-500">
            <Link to="/login" className="font-medium text-violet-400 hover:text-violet-300">
              Back to sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
