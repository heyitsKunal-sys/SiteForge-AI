// Shared, hand-styled (pure Tailwind) UI building blocks used across the app.
import { forwardRef, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ImageOff, Sparkles, Loader2 } from "lucide-react";
import { safePreviewHtml } from "../../utils/safePreview";

/* ── Backdrop ──────────────────────────────────────────────────────────
   Fixed, full-viewport animated gradient blobs + subtle grid. Sits behind
   every page (z-0), pointer-events disabled so it never blocks clicks. */
export function Backdrop({ grid = true }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#05050a]">
      <div
        className="absolute -top-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-violet-600/30 blur-[120px] animate-blob-a"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full bg-blue-600/25 blur-[130px] animate-blob-b"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600/15 blur-[140px] animate-blob-c"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/4 h-[24rem] w-[24rem] rounded-full bg-cyan-500/15 blur-[110px] animate-blob-b"
        aria-hidden="true"
      />
      {grid && (
        <div
          className="absolute inset-0 opacity-[0.15] animate-grid-pan"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
          }}
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05050a]" />
    </div>
  );
}

/* ── Logo ─────────────────────────────────────────────────────────────── */
export function Logo({ to = "/", className = "" }) {
  return (
    <Link
      to={to}
      className={`group flex items-center gap-2 shrink-0 ${className}`}
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 shadow-lg shadow-violet-900/40 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
        <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-white">
        SiteForge<span className="text-violet-400">AI</span>
      </span>
    </Link>
  );
}

/* ── Card ─────────────────────────────────────────────────────────────── */
export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={`card-glass rounded-2xl ${
        hover
          ? "transition-all duration-300 hover:border-violet-400/30 hover:shadow-[0_0_40px_-12px_rgba(139,92,246,0.35)] hover:-translate-y-0.5"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Badge ────────────────────────────────────────────────────────────── */
export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 ${className}`}
    >
      {children}
    </span>
  );
}

/* ── Spinner ──────────────────────────────────────────────────────────── */
export function Spinner({ className = "h-5 w-5" }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

/* ── Input (text / password with show-hide) ──────────────────────────── */
export const Input = forwardRef(function Input(
  { label, hint, error, type = "text", className = "", id, rightSlot, ...props },
  ref,
) {
  const inputId = id || props.name;
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && show ? "text" : type;
  const hasRight = isPassword || rightSlot;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-zinc-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-colors duration-200 ${
            hasRight ? "pr-11" : ""
          } ${
            error
              ? "border-red-500/50 focus:border-red-500"
              : "border-white/10 focus:border-violet-400/60 focus:bg-white/[0.07]"
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
          >
            {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        )}
        {!isPassword && rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
      {(error || hint) && (
        <p className={`mt-1.5 text-xs ${error ? "text-red-400" : "text-zinc-500"}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

/* ── ProjectThumbnail: scaled iframe preview for cards ───────────────── */
const RENDER_WIDTH = 1280;
const RENDER_HEIGHT = 800;

export function ProjectThumbnail({ html, className = "", ratio = "16/10" }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.25);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setScale(w / RENDER_WIDTH);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => setLoaded(false), [html]);

  const hasHtml = Boolean(html && html.length > 80);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full overflow-hidden rounded-t-2xl bg-zinc-900 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {hasHtml ? (
        <>
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-xs text-zinc-500">
              <span className="animate-pulse">Loading preview…</span>
            </div>
          )}
          <iframe
            title="Project preview"
            srcDoc={safePreviewHtml(html)}
            sandbox=""
            loading="lazy"
            onLoad={() => setLoaded(true)}
            aria-hidden="true"
            tabIndex={-1}
            className="absolute left-0 top-0 border-0"
            style={{
              width: `${RENDER_WIDTH}px`,
              height: `${RENDER_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              pointerEvents: "none",
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-600">
          <ImageOff className="h-6 w-6" />
          <span className="text-xs">No preview yet</span>
        </div>
      )}
      <div className="absolute inset-0" />
    </div>
  );
}

/* ── FullScreenMessage: centered full-viewport status screen ─────────── */
export function FullScreenMessage({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Backdrop grid={false} />
      {children}
    </div>
  );
}

/* ── EmptyState ───────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
          <Icon className="h-6 w-6 text-zinc-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-zinc-500">{description}</p>
      )}
      {action}
    </div>
  );
}
