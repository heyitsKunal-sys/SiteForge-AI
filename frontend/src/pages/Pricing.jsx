import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Zap, Sparkles, AlertTriangle, History } from "lucide-react";
import { Backdrop, Badge, Card, Spinner } from "../components/ui/Shared";
import {
  apiError,
  createCheckoutSession,
  getPackages,
  getPaymentHistory,
  verifySession,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Pricing() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const { user, updateUser } = useAuth();

  const [packages, setPackages] = useState([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [history, setHistory] = useState([]);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getPackages();
        setPackages(res.packages || []);
        setConfigured(res.configured);
        if (user) {
          const hist = await getPaymentHistory().catch(() => null);
          if (hist) setHistory(hist.payment || []);
        }
      } catch (err) {
        toast.error(apiError(err));
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function confirmPayment(sessionId) {
      setVerifying(true);
      try {
        const res = await verifySession(sessionId);
        if (res.user) updateUser(res.user);
        toast.success(
          res.alreadyCredited
            ? "Payment already confirmed."
            : `${res.creditsAdded ?? ""} credits added to your account!`,
        );
        const hist = await getPaymentHistory().catch(() => null);
        if (hist) setHistory(hist.payment || []);
      } catch (err) {
        toast.error(apiError(err));
      } finally {
        setVerifying(false);
        setParams({}, { replace: true });
      }
    }

    const sessionId = params.get("session_id");
    const cancelled = params.get("cancelled");
    if (sessionId && user) {
      confirmPayment(sessionId);
    } else if (cancelled) {
      toast.info("Checkout was cancelled — no charge was made.");
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleBuy(pkg) {
    if (!user) return navigate("/login", { state: { from: "/pricing" } });
    setBuyingId(pkg.id);
    try {
      const res = await createCheckoutSession(pkg.id);
      window.location.assign(res.url);
    } catch (err) {
      toast.error(apiError(err));
      setBuyingId(null);
    }
  }

  return (
    <div className="relative min-h-screen px-4 pb-20 pt-16 sm:px-6 lg:px-8">
      <Backdrop />
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge className="mx-auto mb-4 border-amber-400/20 bg-amber-500/10 text-amber-300">
            <Zap className="h-3.5 w-3.5" /> Simple, credit-based pricing
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pay only for what you build
          </h1>
          <p className="mt-4 text-zinc-400">
            No subscriptions. Buy a credit pack, spend it generating and
            editing sites, top up anytime.
          </p>
          {user && (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              You currently have{" "}
              <span className="font-semibold text-white">{user.credits ?? 0}</span> credits
            </p>
          )}
        </div>

        {!configured && (
          <div className="mx-auto mb-10 flex max-w-2xl items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Payments aren't configured on the server yet (missing
            STRIPE_SECRET_KEY). Purchases are disabled until that's set.
          </div>
        )}

        {verifying && (
          <div className="mx-auto mb-10 flex max-w-2xl items-center justify-center gap-2 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm text-violet-200">
            <Spinner className="h-4 w-4" /> Confirming your payment…
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Spinner className="h-8 w-8 text-violet-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                hover
                className={`relative flex flex-col p-6 ${
                  pkg.highlighted ? "border-violet-400/40 ring-1 ring-violet-400/30" : ""
                }`}
              >
                {pkg.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-1 text-[11px] font-semibold text-white shadow-lg">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{pkg.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    ${(pkg.amount / 100).toFixed(2)}
                  </span>
                  <span className="text-sm text-zinc-500">one-time</span>
                </div>
                <ul className="mt-5 space-y-2.5 text-sm text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    {pkg.credits} generation credits
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    {pkg.perCredit} per credit
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    Credits never expire
                  </li>
                </ul>
                <button
                  onClick={() => handleBuy(pkg)}
                  disabled={!configured || buyingId === pkg.id}
                  className={`mt-7 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 ${
                    pkg.highlighted
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-900/30 hover:shadow-violet-700/40"
                      : "border border-white/15 text-white hover:bg-white/5"
                  }`}
                >
                  {buyingId === pkg.id ? <Spinner className="h-4 w-4" /> : "Buy credits"}
                </button>
              </Card>
            ))}
          </div>
        )}

        {user && history.length > 0 && (
          <div className="mx-auto mt-16 max-w-2xl">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <History className="h-4 w-4" /> Payment history
            </h2>
            <Card className="divide-y divide-white/[0.06]">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between px-5 py-3.5 text-sm"
                >
                  <div>
                    <p className="font-medium text-white capitalize">{h.packageId} pack</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">
                      ${(h.amount / 100).toFixed(2)} {h.currency?.toUpperCase()}
                    </p>
                    <p className="text-xs text-emerald-400">
                      +{h.creditsPurchased} credits
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
