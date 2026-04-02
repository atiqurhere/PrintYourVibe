"use client";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error" | "info" | "warning";
type Toast = { id: string; type: ToastType; message: string };

type ToastCtx = { toast: (message: string, type?: ToastType) => void };
const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const icons = {
  success: <CheckCircle size={16} className="text-green-400 shrink-0" />,
  error:   <XCircle    size={16} className="text-red-400   shrink-0" />,
  info:    <Info       size={16} className="text-blue-400  shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
};

const bgMap: Record<ToastType, string> = {
  success: "border-green-400/30 bg-green-400/5",
  error:   "border-red-400/30   bg-red-400/5",
  info:    "border-blue-400/30  bg-blue-400/5",
  warning: "border-amber-400/30 bg-amber-400/5",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const remove = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-xl border glass pointer-events-auto",
              "shadow-xl animate-fade-in-up min-w-[280px] max-w-sm",
              bgMap[t.type]
            )}
          >
            {icons[t.type]}
            <p className="text-sm text-cream flex-1 leading-snug">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-cream-faint hover:text-cream transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
