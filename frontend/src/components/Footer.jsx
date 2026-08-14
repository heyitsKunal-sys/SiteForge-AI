import { GitBranch, AtSign, Sparkles } from "lucide-react";
import { Logo } from "./ui/Shared";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="text-sm text-zinc-500">
            Turn a single prompt into a live, deployable website.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <a href="/community" className="hover:text-zinc-300">
            Community
          </a>
          <a href="/pricing" className="hover:text-zinc-300">
            Pricing
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-zinc-300"
          >
            <GitBranch className="h-4 w-4" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-zinc-300"
          >
            <AtSign className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-white/[0.06] pt-6 text-xs text-zinc-600 sm:flex-row">
        <p>© {new Date().getFullYear()} SiteForgeAI. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" /> Built with AI,
          for builders.
        </p>
      </div>
    </footer>
  );
}
