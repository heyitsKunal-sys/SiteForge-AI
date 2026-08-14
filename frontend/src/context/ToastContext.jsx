import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, type }]);
      if (duration) setTimeout(() => remove(id), duration);
      return id;
    },
    [remove],
  );

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[9999] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:inset-x-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-fade-up pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border border-white/10 bg-zinc-900/95 px-4 py-3 text-sm text-white shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            {t.type === "success" && (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            )}
            {t.type === "error" && (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            )}
            {t.type === "info" && (
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            )}
            <p className="flex-1 leading-snug text-zinc-200">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
