"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, removing: true } : toast
      )
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = `toast-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const newToast = {
        id,
        message,
        type,
        removing: false,
      };

      setToasts((prev) => [...prev, newToast]);

      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, 5000);

      timeoutsRef.current.set(id, timeoutId);
    },
    [removeToast]
  );

  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-9999 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const config = {
    success: {
      bg: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      icon: "✓",
      iconBg: "bg-white/20",
    },
    error: {
      bg: "bg-gradient-to-r from-red-500 to-red-600",
      icon: "✕",
      iconBg: "bg-white/20",
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-500 to-amber-600",
      icon: "⚠",
      iconBg: "bg-white/20",
    },
    info: {
      bg: "bg-gradient-to-r from-blue-500 to-blue-600",
      icon: "ℹ",
      iconBg: "bg-white/20",
    },
  };

  const { bg, icon, iconBg } = config[toast.type] || config.info;

  return (
    <div
      className={`
        ${bg} 
        ${toast.removing ? "animate-slideOut" : "animate-slideIn"}
        pointer-events-auto
        text-white px-5 py-4 rounded-xl shadow-2xl
        flex items-center gap-3 min-w-[320px] max-w-md
        backdrop-blur-sm
        transform transition-all duration-300
        hover:scale-105
        relative overflow-hidden
      `}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-shrink origin-left" />

      {/* Icon */}
      <div
        className={`${iconBg} w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-lg`}
      >
        {icon}
      </div>

      {/* Message */}
      <span className="flex-1 text-sm font-medium leading-snug">
        {toast.message}
      </span>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-6 h-6 flex items-center justify-center transition-colors shrink-0 font-bold"
      >
        ×
      </button>
    </div>
  );
};
