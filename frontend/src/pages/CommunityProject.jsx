import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Eye, ExternalLink } from "lucide-react";
import { Backdrop, Spinner } from "../components/ui/Shared";
import { apiError, getCommunityProject, likeCommunityProject } from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { safePreviewHtml } from "../utils/safePreview";

export default function CommunityProject() {
  const { id } = useParams();
  const toast = useToast();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      try {
        const res = await getCommunityProject(id);
        setProject(res.project);
      } catch (err) {
        toast.error(apiError(err));
      } finally {
        setLoading(false);
      }
    }
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleLike() {
    if (!user) return toast.info("Sign in to like this project.");
    if (project.isOwn) return toast.info("You can't like your own project.");
    setLiking(true);
    try {
      const res = await likeCommunityProject(id);
      setProject((p) => ({ ...p, likes: res.likes, likedByMe: res.liked }));
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLiking(false);
    }
  }

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
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#05050a]/70 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/community"
            className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{project.name}</p>
            <p className="truncate text-xs text-zinc-500">by {project.author}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400">
            <Eye className="h-3.5 w-3.5" /> {project.views ?? 0}
          </span>
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              project.likedByMe
                ? "border-rose-400/30 bg-rose-500/10 text-rose-300"
                : "border-white/10 text-zinc-300 hover:text-white"
            }`}
          >
            <Heart className="h-3.5 w-3.5" fill={project.likedByMe ? "currentColor" : "none"} />
            {project.likes ?? 0}
          </button>
          {project.isOwn && (
            <Link
              to={`/project/${project.id}`}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-900/30"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="relative flex-1 bg-zinc-950">
        {project.html && project.html.length > 80 ? (
          <iframe
            title={project.name}
            srcDoc={safePreviewHtml(project.html)}
            sandbox="allow-scripts allow-forms allow-modals allow-popups"
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            No preview available.
          </div>
        )}
      </div>
    </div>
  );
}
