import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

/**
 * Lightweight toast notifications.
 * Usage: const toast = useToast(); toast.success("Saved"); toast.error("Oops");
 */
const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "success") => {
      const id = nextId++;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  const api = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-full max-w-xs flex-col gap-2">
        {toasts.map((t) => {
          const Icon = t.type === "error" ? AlertCircle : CheckCircle2;
          const color =
            t.type === "error"
              ? "text-red-600"
              : t.type === "info"
              ? "text-charcoal"
              : "text-green-600";
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-charcoal/[0.06] bg-white px-4 py-3 shadow-lift animate-fadeUp"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
              <span className="flex-1 text-sm text-charcoal">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="text-charcoal/40 transition hover:text-charcoal"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  // Safe no-op if used outside a provider (keeps components decoupled).
  if (!ctx) return { success: () => {}, error: () => {}, info: () => {} };
  return ctx;
}
