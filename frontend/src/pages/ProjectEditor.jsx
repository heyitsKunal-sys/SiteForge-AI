import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Send,
  ArrowLeft,
  Globe,
  Rocket,
  Loader2,
  Bot,
  User,
  Pencil,
  Check,
  X as XIcon,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Backdrop, Spinner } from "../components/ui/Shared";
import DeployModal from "../components/DeployModal";
import {
  apiError,
  generateProject,
  getProject,
  updateProject,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { safePreviewHtml } from "../utils/safePreview";

export default function ProjectEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, updateUser } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [publishing, setPublishing] = useState(false);
  const autoTriggered = useRef(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project?.messages?.length]);

  async function load() {
    setLoading(true);
    try {
      const res = await getProject(id);
      setProject(res.project);
      setNameDraft(res.project.name);

      const autogen = params.get("autogen");
      const initialPrompt = res.project.prompt;
      if (
        autogen &&
        !autoTriggered.current &&
        (!res.project.html || res.project.html.length < 100)
      ) {
        autoTriggered.current = true;
        await runGenerate(initialPrompt);
      }
    } catch (err) {
      toast.error(apiError(err));
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function runGenerate(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    setGenerating(true);
    try {
      const res = await generateProject(id, trimmed);
      setProject(res.project);
      if (res.user) updateUser(res.user);
      setPrompt("");
    } catch (err) {
      if (err?.response?.status === 402) {
        toast.error("Not enough credits — top up to keep generating.");
      } else {
        toast.error(apiError(err));
      }
    } finally {
      setGenerating(false);
    }
  }

  function handleSend(e) {
    e?.preventDefault();
    runGenerate(prompt);
  }

  async function handleSaveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    try {
      const res = await updateProject(id, { name: trimmed });
      setProject(res.project);
      setEditingName(false);
      toast.success("Project renamed.");
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  async function togglePublish() {
    setPublishing(true);
    try {
      const res = await updateProject(id, { published: !project.published });
      setProject(res.project);
      toast.success(res.project.published ? "Published to community!" : "Unpublished.");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setPublishing(false);
    }
  }

  const isFirstGeneration = !project?.html || project.html.length < 100;
  const cost = isFirstGeneration ? 5 : 2;

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <Backdrop grid={false} />
        <Spinner className="h-8 w-8 text-violet-400" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <Backdrop grid={false} />

      {/* header bar */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#05050a]/70 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-white outline-none focus:border-violet-400/60"
              />
              <button
                onClick={handleSaveName}
                className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNameDraft(project.name);
                }}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="group flex min-w-0 items-center gap-1.5"
            >
              <span className="truncate text-sm font-semibold text-white">
                {project.name}
              </span>
              <Pencil className="h-3 w-3 shrink-0 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {project.deployUrl && (
            <a
              href={project.deployUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white sm:flex"
            >
              <ExternalLink className="h-3 w-3" /> Live
            </a>
          )}
          <button
            onClick={togglePublish}
            disabled={publishing || isFirstGeneration}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
              project.published
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 text-zinc-300 hover:text-white"
            }`}
          >
            {publishing ? <Spinner className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
            {project.published ? "Published" : "Publish"}
          </button>
          <button
            onClick={() => setDeployOpen(true)}
            disabled={isFirstGeneration}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-900/30 disabled:opacity-40"
          >
            <Rocket className="h-3.5 w-3.5" /> Deploy
          </button>
        </div>
      </div>

      {/* body: chat + preview */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* chat panel */}
        <div className="flex min-h-0 w-full flex-col border-white/[0.06] lg:w-[380px] lg:border-r">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {(project.messages || []).map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-violet-500 to-blue-500"
                        : "bg-white/10"
                    }`}
                  >
                    {m.role === "user" ? (
                      <User className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-violet-300" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-violet-600/90 to-blue-600/90 text-white"
                        : "card-glass text-zinc-300"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {generating && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Bot className="h-3.5 w-3.5 text-violet-300" />
                  </div>
                  <div className="card-glass flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm text-zinc-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {isFirstGeneration ? "Building your site…" : "Applying changes…"}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <form
            onSubmit={handleSend}
            className="shrink-0 border-t border-white/[0.06] p-3"
          >
            <div className="card-glass flex items-end gap-2 rounded-2xl p-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder={
                  isFirstGeneration
                    ? "Describe the site you want…"
                    : "Ask for a change — “make the hero darker”…"
                }
                className="max-h-32 w-full resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-zinc-500 outline-none"
              />
              <button
                type="submit"
                disabled={generating || !prompt.trim() || (user?.credits ?? 0) < cost}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-900/30 disabled:opacity-40"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 px-1 text-[11px] text-zinc-600">
              This {isFirstGeneration ? "build" : "edit"} costs {cost} credit
              {cost === 1 ? "" : "s"} · You have {user?.credits ?? 0}
            </p>
          </form>
        </div>

        {/* preview panel */}
        <div className="relative min-h-[45vh] flex-1 bg-zinc-950 lg:min-h-0">
          {project.html && project.html.length > 80 ? (
            <iframe
              key={project.updatedAt}
              title="Live preview"
              srcDoc={safePreviewHtml(project.html)}
              sandbox="allow-scripts allow-forms allow-modals allow-popups"
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-600">
              {generating ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                  <p className="text-sm">Generating your first draft…</p>
                </>
              ) : (
                <>
                  <RefreshCw className="h-8 w-8" />
                  <p className="text-sm">
                    Send a prompt on the left to generate your site.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {deployOpen && (
        <DeployModal
          projectId={id}
          projectName={project.name}
          onClose={() => setDeployOpen(false)}
        />
      )}
    </div>
  );
}
