"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Command } from "lucide-react";

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only trigger if not in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      const key = e.key.toLowerCase();

      // ? = show shortcuts
      if (key === "?") { e.preventDefault(); setShowHelp(h => !h); return; }

      // Escape = close help
      if (key === "escape") { setShowHelp(false); return; }

      // g + key = navigate
      if (e.metaKey || e.ctrlKey) {
        if (key === "k") { e.preventDefault(); setShowHelp(h => !h); }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  if (!showHelp) return (
    <button
      onClick={() => setShowHelp(true)}
      className="fixed bottom-6 left-6 z-30 w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-all"
      title="Keyboard shortcuts (?)"
    >
      <span className="text-xs font-bold">?</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
      <div className="glass-card w-full max-w-md mx-4 rounded-2xl border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-blue-400" />
            <h3 className="text-white font-bold">Keyboard Shortcuts</h3>
          </div>
          <button onClick={() => setShowHelp(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-1">
          {[
            { keys: ["?"], desc: "Show/hide shortcuts" },
            { keys: ["Esc"], desc: "Close modals / dialogs" },
            { keys: ["Ctrl", "K"], desc: "Open command palette" },
          ].map(s => (
            <div key={s.desc} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/4">
              <span className="text-gray-400 text-sm">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map(k => (
                  <kbd key={k} className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-white text-xs font-mono">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <p className="text-gray-600 text-xs text-center">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-white text-xs font-mono">?</kbd> anytime to show this</p>
        </div>
      </div>
    </div>
  );
}