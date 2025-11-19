/**
 * Sistema de Toast Moderno
 * 
 * Notificações pequenas e elegantes que aparecem no topo da tela
 * com animações suaves e desaparecem automaticamente.
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ModernToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    text: "text-green-900 dark:text-green-100",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
    text: "text-red-900 dark:text-red-100",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600 dark:text-amber-400",
    text: "text-amber-900 dark:text-amber-100",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    text: "text-blue-900 dark:text-blue-100",
  },
};

export function ModernToast({
  id,
  type,
  title,
  description,
  duration = 4000,
  onClose,
}: ModernToastProps) {
  const Icon = icons[type];
  const colorScheme = colors[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg
        ${colorScheme.bg} ${colorScheme.border}
      `}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${colorScheme.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${colorScheme.text}`}>
              {title}
            </p>
            {description && (
              <p className={`mt-1 text-xs ${colorScheme.text} opacity-80`}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => onClose(id)}
            className={`flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${colorScheme.icon}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className={`h-1 ${colorScheme.icon.replace("text-", "bg-")} opacity-30`}
        />
      )}
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex flex-col items-center gap-2 p-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ModernToast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
