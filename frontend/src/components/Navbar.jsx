import { NavLink, useNavigate, Link } from "react-router-dom";
import { Zap, Settings, X, Menu, LogOut, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./ui/Shared";
import { Button } from "./ui/button";

const links = [
  { label: "Home", to: "/" },
  { label: "My Projects", to: "/dashboard", protected: true },
  { label: "Community", to: "/community" },
  { label: "Pricing", to: "/pricing" },
];

const accountLinks = [
  { label: "Buy credits", icon: Zap, to: "/pricing", accent: true },
  { label: "Settings", icon: Settings, to: "/settings" },
];

function UserMenu() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  const initials = (user.name || user.email || "U")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative flex items-center gap-3">
      <button
        onClick={() => navigate("/pricing")}
        title="Buy more credits"
        className="group flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-400/20"
      >
        <Zap className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Credits:</span>
        <span className="font-semibold text-amber-200">{user.credits ?? 0}</span>
        <Plus className="h-3 w-3 opacity-70 transition-transform group-hover:rotate-90" />
      </button>

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-semibold text-white shadow-lg shadow-violet-900/30 transition-transform hover:scale-105"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/50 backdrop-blur-xl animate-fade-up">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
          <div className="p-1.5">
            {accountLinks.map(({ label, icon: Icon, to, accent }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Icon className={`h-4 w-4 ${accent ? "text-amber-400" : "text-zinc-400"}`} />
                {label}
              </Link>
            ))}
            <button
              onClick={() => {
                logoutUser();
                setOpen(false);
                navigate("/");
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const isAuthed = Boolean(user);
  const [open, setOpen] = useState(false);
  const visibleLinks = links.filter((l) => !l.protected || isAuthed);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05050a]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthed ? (
            <UserMenu />
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <button
                onClick={() => navigate("/register")}
                className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:shadow-violet-700/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <Button
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-[#05050a]/95 px-4 pb-5 pt-3 backdrop-blur-xl md:hidden animate-fade-up">
          <div className="flex flex-col gap-1">
            {visibleLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1 border-t border-white/10 pt-3">
            {isAuthed ? (
              <>
                {accountLinks.map(({ label, icon: Icon, to, accent }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
                  >
                    <Icon className={`h-4 w-4 ${accent ? "text-amber-400" : "text-zinc-400"}`} />
                    {label}
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    logoutUser();
                    setOpen(false);
                    navigate("/");
                  }}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
                >
                  Sign In
                </Link>
                <Button
                  onClick={() => {
                    navigate("/register");
                    setOpen(false);
                  }}
                  className="mt-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
