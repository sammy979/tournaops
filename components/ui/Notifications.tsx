"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { Check, X, AlertTriangle, Info, Zap } from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notify: (n: Omit<Notification, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be inside NotificationProvider");
  return ctx;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const remove = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((n: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 10);
    setNotifications(prev => [...prev.slice(-4), { ...n, id }]);
    setTimeout(() => remove(id), n.duration || 4000);
  }, [remove]);

  const success = useCallback((title: string, message?: string) => notify({ type: "success", title, message }), [notify]);
  const error = useCallback((title: string, message?: string) => notify({ type: "error", title, message, duration: 6000 }), [notify]);
  const warning = useCallback((title: string, message?: string) => notify({ type: "warning", title, message }), [notify]);
  const info = useCallback((title: string, message?: string) => notify({ type: "info", title, message }), [notify]);

  const icons = { success: Check, error: X, warning: AlertTriangle, info: Info };
  const styles = {
    success: "border-green-500/30 bg-green-500/10 text-green-400",
    error: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  };

  return (
    <NotificationContext.Provider value={{ notify, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 w-80">
        {notifications.map(n => {
          const Icon = icons[n.type];
          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl animate-slide-in ${styles[n.type]}`}
              style={{ background: "rgba(10,10,15,0.95)" }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${styles[n.type]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{n.title}</p>
                {n.message && <p className="text-gray-400 text-xs mt-0.5">{n.message}</p>}
              </div>
              <button
                onClick={() => remove(n.id)}
                className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}