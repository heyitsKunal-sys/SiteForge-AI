import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Mail } from "lucide-react";
import { Backdrop, Card, Input, Logo, Spinner } from "../components/ui/Shared";
import { apiError, login } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.token, res.user);
      toast.success(`Welcome back, ${res.user.name.split(" ")[0]}!`);
      const from = location.state?.from;
      navigate(from && from !== "/login" ? from : "/dashboard");
    } catch (err) {
      if (err?.response?.data?.needsVerification) {
        toast.info("Please verify your email to continue.");
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
        return;
      }
      setError(apiError(err));
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Sign in to keep building your sites.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
              rightSlot={<Mail className="h-4 w-4 text-zinc-500" />}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={update("password")}
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-violet-400 hover:text-violet-300"
              >
                Forgot password?
              </Link>
            </div>

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
              {loading ? <Spinner className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-violet-400 hover:text-violet-300">
              Sign up free
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
