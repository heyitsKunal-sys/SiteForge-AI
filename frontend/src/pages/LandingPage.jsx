import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Wand2,
  Rocket,
  Globe,
  MessageSquare,
  ShieldCheck,
  Layers,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Backdrop, Badge, Card } from "../components/ui/Shared";
import Footer from "../components/Footer";

const EXAMPLE_PROMPTS = [
  "A minimalist portfolio for a wildlife photographer",
  "A landing page for an AI-powered coffee subscription",
  "A sleek SaaS product page for a dev-tools startup",
  "A cozy bakery site with online ordering",
];

const FEATURES = [
  {
    icon: Wand2,
    title: "Prompt to production",
    desc: "Describe the site you want in plain English — SiteForge writes complete, styled HTML in seconds.",
  },
  {
    icon: MessageSquare,
    title: "Iterate with chat",
    desc: "Keep refining: “make the hero darker”, “add a pricing table” — every message updates the live site.",
  },
  {
    icon: Globe,
    title: "One-click deploy",
    desc: "Push straight to GitHub Pages or Vercel and get a shareable live URL in under a minute.",
  },
  {
    icon: Layers,
    title: "Community gallery",
    desc: "Publish your build, browse what others are making, and remix ideas from the community feed.",
  },
  {
    icon: ShieldCheck,
    title: "Safe, sandboxed preview",
    desc: "Every generated site runs in an isolated preview with working nav, forms, and cart interactions.",
  },
  {
    icon: Zap,
    title: "Credit-based & fair",
    desc: "Pay only for what you generate — starter packs from a few dollars, no subscriptions required.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Describe your idea",
    desc: "Type a short prompt — the vibe, the industry, the sections you want.",
  },
  {
    n: "02",
    title: "Watch it get built",
    desc: "Our AI drafts a full responsive site with real content in moments.",
  },
  {
    n: "03",
    title: "Refine & deploy",
    desc: "Chat to tweak the design, then publish to Vercel or GitHub Pages.",
  },
];

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <LogosStrip />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthed = Boolean(user);
  const [prompt, setPrompt] = useState("");

  function handleCreate() {
    const trimmed = prompt.trim();
    if (isAuthed) {
      navigate(
        trimmed ? `/dashboard?prompt=${encodeURIComponent(trimmed)}` : "/dashboard",
      );
    } else {
      navigate("/register");
    }
  }

  return (
    <section className="relative overflow-hidden px-4 pt-24 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:px-8">
      <Backdrop grid />
      <div className="mx-auto max-w-4xl text-center">
        <div className="animate-fade-up mx-auto mb-6 inline-flex">
          <Badge className="border-violet-400/20 bg-violet-500/10 text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI website builder, from prompt to live URL
          </Badge>
        </div>

        <h1
          className="animate-fade-up text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl"
          style={{ animationDelay: "60ms" }}
        >
          Describe it. Watch it{" "}
          <span className="text-gradient">build itself.</span>
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-2xl text-base text-zinc-400 sm:text-lg"
          style={{ animationDelay: "120ms" }}
        >
          SiteForge turns a single sentence into a complete, responsive
          website — then lets you refine it with chat and deploy it live in
          one click.
        </p>

        <div
          className="animate-fade-up mx-auto mt-10 max-w-2xl"
          style={{ animationDelay: "180ms" }}
        >
          <div className="card-glass flex flex-col gap-3 rounded-2xl p-2 shadow-2xl shadow-black/40 sm:flex-row sm:items-center">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="A portfolio site for a UX designer with a dark theme…"
              className="w-full flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none"
            />
            <button
              onClick={handleCreate}
              className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:shadow-violet-700/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              Generate site
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-violet-400/30 hover:text-zinc-200"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <p
          className="animate-fade-up mt-6 text-xs text-zinc-600"
          style={{ animationDelay: "240ms" }}
        >
          No credit card required to start · Free credits on signup
        </p>
      </div>
    </section>
  );
}

function LogosStrip() {
  const items = ["GitHub Pages", "Vercel", "Stripe", "MongoDB", "React"];
  return (
    <section className="relative border-y border-white/[0.06] bg-white/[0.015] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3">
        {items.map((i) => (
          <span
            key={i}
            className="text-xs font-medium uppercase tracking-widest text-zinc-600"
          >
            {i}
          </span>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge className="mx-auto mb-4 border-blue-400/20 bg-blue-500/10 text-blue-300">
            Why SiteForge
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to ship a site today
          </h2>
          <p className="mt-4 text-zinc-400">
            From first prompt to a live URL — no design tools, no boilerplate,
            no waiting on a developer.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} hover className="p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-violet-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-white">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">{desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge className="mx-auto mb-4 border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
            How it works
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Three steps to a live website
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-gradient text-3xl font-bold">{s.n}</span>
                {i < STEPS.length - 1 && (
                  <div className="hidden h-px flex-1 bg-gradient-to-r from-white/20 to-transparent sm:block" />
                )}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Card className="relative overflow-hidden px-8 py-16 text-center sm:px-16">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/30 blur-[100px]"
            aria-hidden="true"
          />
          <Rocket className="mx-auto mb-5 h-8 w-8 text-violet-300" />
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to build your next site?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Join builders shipping landing pages, portfolios, and stores in
            minutes — not weeks.
          </p>
          <button
            onClick={() => navigate(user ? "/dashboard" : "/register")}
            className="group mx-auto mt-8 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:shadow-violet-700/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            {user ? "Go to dashboard" : "Start building for free"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </Card>
      </div>
    </section>
  );
}
