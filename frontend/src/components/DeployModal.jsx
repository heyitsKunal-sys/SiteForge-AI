import { useState } from "react";
import { X, GitBranch, Rocket, ExternalLink } from "lucide-react";
import { Input, Spinner } from "./ui/Shared";
import { apiError, deployToVercel, uploadToGithub } from "../utils/api";
import { useToast } from "../context/ToastContext";
import { Button } from "./ui/button";

export default function DeployModal({ projectId, projectName, onClose }) {
  const toast = useToast();
  const [tab, setTab] = useState("vercel");

  // Vercel state
  const [vercelToken, setVercelToken] = useState("");
  const [vercelProjectName, setVercelProjectName] = useState(projectName || "");
  const [vercelLoading, setVercelLoading] = useState(false);
  const [vercelResult, setVercelResult] = useState(null);

  // GitHub state
  const [ghToken, setGhToken] = useState("");
  const [repoName, setRepoName] = useState(
    (projectName || "my-siteforge-site").toLowerCase().replace(/[^a-z0-9._-]+/g, "-"),
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghResult, setGhResult] = useState(null);

  async function handleVercel(e) {
    e.preventDefault();
    setVercelLoading(true);
    setVercelResult(null);
    try {
      const res = await deployToVercel(projectId, {
        token: vercelToken.trim(),
        projectName: vercelProjectName.trim(),
      });
      setVercelResult(res);
      toast.success("Deployed to Vercel!");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setVercelLoading(false);
    }
  }

  async function handleGithub(e) {
    e.preventDefault();
    if (ghToken.trim().length < 20) return toast.error("That doesn't look like a valid GitHub token.");
    if (!repoName.trim()) return toast.error("Repo name is required.");
    setGhLoading(true);
    setGhResult(null);
    try {
      const res = await uploadToGithub(projectId, {
        token: ghToken.trim(),
        repoName: repoName.trim(),
        isPrivate,
        enablePages: true,
      });
      setGhResult(res);
      toast.success("Pushed to GitHub!");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setGhLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-up">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Deploy your site</h2>
          <Button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex border-b border-white/10 px-3 pt-3">
          {[
            { key: "vercel", label: "Vercel", icon: Rocket },
            { key: "github", label: "GitHub Pages", icon: GitBranch },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === key
                  ? "border-b-2 border-violet-500 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </Button>
          ))}
        </div>

        <div className="p-6">
          {tab === "vercel" ? (
            <form onSubmit={handleVercel} className="space-y-4">
              <p className="text-sm text-zinc-400">
                Paste a Vercel access token (from{" "}
                <span className="text-zinc-300">vercel.com/account/tokens</span>) to deploy
                instantly. If your server already has <code className="text-zinc-300">VERCEL_TOKEN</code>{" "}
                configured, you can leave this blank.
              </p>
              <Input
                label="Vercel token (optional if server-configured)"
                type="password"
                placeholder="vercel_xxx"
                value={vercelToken}
                onChange={(e) => setVercelToken(e.target.value)}
              />
              <Input
                label="Project name"
                value={vercelProjectName}
                onChange={(e) => setVercelProjectName(e.target.value)}
              />
              <Button
                type="submit"
                disabled={vercelLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 disabled:opacity-60"
              >
                {vercelLoading ? <Spinner className="h-4 w-4" /> : <Rocket className="h-4 w-4" />}
                Deploy to Vercel
              </Button>

              {vercelResult && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                  <p className="mb-1 font-medium">Live!</p>
                  <a
                    href={vercelResult.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 break-all text-emerald-200 hover:underline"
                  >
                    {vercelResult.url} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleGithub} className="space-y-4">
              <p className="text-sm text-zinc-400">
                Paste a GitHub personal access token with <code className="text-zinc-300">repo</code>{" "}
                and <code className="text-zinc-300">pages</code> scopes.
              </p>
              <Input
                label="GitHub token"
                type="password"
                placeholder="ghp_xxx"
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
              />
              <Input
                label="Repository name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-violet-500"
                />
                Make repository private
              </label>
              <Button
                type="submit"
                disabled={ghLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 disabled:opacity-60"
              >
                {ghLoading ? <Spinner className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
                Push to GitHub
              </Button>

              {ghResult && (
                <div className="space-y-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                  <p className="font-medium">Pushed!</p>
                  <a
                    href={ghResult.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 break-all text-emerald-200 hover:underline"
                  >
                    Repository <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                  {ghResult.pagesUrl && (
                    <a
                      href={ghResult.pagesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 break-all text-emerald-200 hover:underline"
                    >
                      Live site (GitHub Pages) <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
