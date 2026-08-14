import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Trash2, Zap, ShieldAlert } from "lucide-react";
import { Backdrop, Card, Input, Spinner } from "../components/ui/Shared";
import { apiError, changePassword, deleteMyAccount, updateProfile } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Settings() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, updateUser, logoutUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", nextPw: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleSaveName(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return toast.error("Name must be at least 2 characters.");
    setSavingName(true);
    try {
      const res = await updateProfile({ name: trimmed });
      updateUser(res.user);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    if (!pwForm.current) return setPwError("Enter your current password.");
    if (pwForm.nextPw.length < 6)
      return setPwError("New password must be at least 6 characters.");
    setSavingPw(true);
    try {
      await changePassword(pwForm);
      toast.success("Password changed.");
      setPwForm({ current: "", nextPw: "" });
    } catch (err) {
      setPwError(apiError(err));
    } finally {
      setSavingPw(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await deleteMyAccount();
      toast.success("Account deleted.");
      logoutUser();
      navigate("/");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setDeleting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <Backdrop grid={false} />
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1.5 text-zinc-400">Manage your account and preferences.</p>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 py-4">
          <div className="flex items-center gap-2.5 text-amber-200">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Available credits</span>
          </div>
          <span className="text-lg font-bold text-white">{user.credits ?? 0}</span>
        </div>

        <Card className="mb-6 p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <User className="h-4 w-4 text-violet-400" />
            <h2 className="text-base font-semibold text-white">Profile</h2>
          </div>
          <form onSubmit={handleSaveName} className="space-y-4">
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" value={user.email} disabled className="opacity-60" />
            <button
              type="submit"
              disabled={savingName || name.trim() === user.name}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 disabled:opacity-50"
            >
              {savingName ? <Spinner className="h-4 w-4" /> : "Save changes"}
            </button>
          </form>
        </Card>

        <Card className="mb-6 p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-violet-400" />
            <h2 className="text-base font-semibold text-white">Change password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
            />
            <Input
              label="New password"
              type="password"
              value={pwForm.nextPw}
              onChange={(e) => setPwForm((f) => ({ ...f, nextPw: e.target.value }))}
              hint="At least 6 characters."
            />
            {pwError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {pwError}
              </p>
            )}
            <button
              type="submit"
              disabled={savingPw}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 disabled:opacity-50"
            >
              {savingPw ? <Spinner className="h-4 w-4" /> : "Update password"}
            </button>
          </form>
        </Card>

        <Card className="border-red-500/20 p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <h2 className="text-base font-semibold text-white">Danger zone</h2>
          </div>
          <p className="mb-4 text-sm text-zinc-400">
            Deleting your account permanently removes all your projects and
            data. This can't be undone.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder='Type "DELETE" to confirm'
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="sm:max-w-[220px]"
            />
            <button
              onClick={handleDelete}
              disabled={deleteConfirm !== "DELETE" || deleting}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-40"
            >
              {deleting ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
              Delete account
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
