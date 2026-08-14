import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, Users, Sparkles } from "lucide-react";
import { Backdrop, Badge, Card, EmptyState, ProjectThumbnail, Spinner } from "../components/ui/Shared";
import { apiError, getCommunity, likeCommunityProject } from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const SORTS = [
  { key: "new", label: "Newest" },
  { key: "views", label: "Most viewed" },
  { key: "likes", label: "Most liked" },
];

export default function Community() {
  const toast = useToast();
  const { user } = useAuth();
  const [sort, setSort] = useState("new");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const res = await getCommunity(sort);
        setProjects(res.projects || []);
      } catch (err) {
        toast.error(apiError(err));
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  async function handleLike(e, p) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.info("Sign in to like projects.");
    if (p.isOwn) return toast.info("You can't like your own project.");
    try {
      const res = await likeCommunityProject(p.id);
      setProjects((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, likes: res.likes, likedByMe: res.liked } : x,
        ),
      );
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  return (
    <div className="relative min-h-screen px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <Backdrop grid={false} />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge className="mb-3 border-violet-400/20 bg-violet-500/10 text-violet-300">
              <Users className="h-3.5 w-3.5" /> Community gallery
            </Badge>
            <h1 className="text-3xl font-bold text-white">Explore what people are building</h1>
            <p className="mt-1.5 text-zinc-400">
              Published sites from the SiteForge community — get inspired, remix ideas.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  sort === s.key
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Spinner className="h-8 w-8 text-violet-400" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nothing published yet"
            description="Be the first to publish a site from your dashboard and it'll show up here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.id} to={`/community/${p.id}`}>
                <Card hover className="group overflow-hidden">
                  <ProjectThumbnail html={p.html} />
                  <div className="p-4">
                    <p className="mb-1 line-clamp-1 text-sm font-semibold text-white">
                      {p.name}
                    </p>
                    <p className="mb-3 text-xs text-zinc-500">by {p.author}</p>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {p.views ?? 0}
                      </span>
                      <button
                        onClick={(e) => handleLike(e, p)}
                        className={`flex items-center gap-1 rounded-full px-2 py-1 transition-colors ${
                          p.likedByMe
                            ? "text-rose-400"
                            : "text-zinc-500 hover:text-rose-300"
                        }`}
                      >
                        <Heart
                          className="h-3.5 w-3.5"
                          fill={p.likedByMe ? "currentColor" : "none"}
                        />
                        {p.likes ?? 0}
                      </button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
