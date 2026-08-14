import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { FullScreenMessage, Logo } from "../components/ui/Shared";

export default function NotFound() {
  return (
    <FullScreenMessage>
      <Logo className="mb-4 justify-center" />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Compass className="h-8 w-8 text-zinc-500" />
      </div>
      <h1 className="text-4xl font-bold text-white">404</h1>
      <p className="max-w-sm text-zinc-400">
        This page drifted off somewhere. Let's get you back on track.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30"
      >
        Back to home
      </Link>
    </FullScreenMessage>
  );
}
