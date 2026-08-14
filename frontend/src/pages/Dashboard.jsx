import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Plus, Sparkles, Trash2, ExternalLink, Clock, ArrowRight } from "lucide-react";
import { Backdrop, Card, EmptyState, ProjectThumbnail, Spinner } from "../components/ui/Shared";
import { apiError, createProject, deleteProject, getProjects } from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState(params.get("prompt") || "");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getProjects();
        setProjects(res.projects || []);
      } catch (err) {
        toast.error(apiError(err));
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e?.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return toast.error("Describe the site you want to build.");
    setCreating(true);
    try {
      const res = await createProject({ prompt: trimmed });
      toast.success("Project created — generating your site…");
      navigate(`/project/${res.project.id}?autogen=1`);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this project? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await deleteProject(id);
      setProjects((p) => p.filter((x) => x.id !== id));
      toast.success("Project deleted.");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="relative min-h-screen px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <Backdrop grid={false} />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-zinc-400">Create a new site, or pick up where you left off.</p>
        </div>

        <Card className="mb-10 p-5 sm:p-6">
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <Sparkles className="h-4 w-4 shrink-0 text-violet-400" />
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the website you want to build…"
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:shadow-violet-700/40 disabled:opacity-60"
            >
              {creating ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              New project
            </button>
          </form>
        </Card>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Spinner className="h-8 w-8 text-violet-400" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No projects yet"
            description="Describe an idea above and SiteForge will build your first site in seconds."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Card key={p.id} hover className="group overflow-hidden">
                <Link to={`/project/${p.id}`}>
                  <ProjectThumbnail html={p.html} />
                </Link>
                <div className="p-4">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <Link
                      to={`/project/${p.id}`}
                      className="line-clamp-1 text-sm font-semibold text-white hover:text-violet-300"
                    >
                      {p.name}
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="Delete project"
                    >
                      {deletingId === p.id ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {timeAgo(p.updatedAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      {p.published && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          Published
                        </span>
                      )}
                      {p.deployUrl && (
                        <a
                          href={p.deployUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-zinc-500 hover:text-violet-300"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("input")?.focus();
              }}
              className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 text-zinc-500 transition-colors hover:border-violet-400/30 hover:text-zinc-300"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">New project</span>
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
