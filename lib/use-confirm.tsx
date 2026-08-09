"use client";

// ============================================================
// lib/use-confirm.tsx
// Global confirm / alert / prompt dialogs via context
// Replaces window.confirm(), window.alert(), window.prompt()
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  ConfirmDialog,
  AlertDialog,
  PromptDialog,
  type ModalVariant,
} from "@/components/ui/Modal";

// ============================================================
// TYPES
// ============================================================

export interface ConfirmOptions {
  title: string;
  description?: string;
  details?: string[];
  note?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info" | "default";
}

export interface AlertOptions {
  title: string;
  description?: string;
  actionLabel?: string;
  variant?: ModalVariant;
}

export interface PromptOptions {
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  cancelLabel?: string;
  variant?: ModalVariant;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  multiline?: boolean;
  helperText?: string;
}

interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
  prompt: (options: PromptOptions) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

// ============================================================
// PROVIDER
// ============================================================

interface DialogState {
  kind: "confirm" | "alert" | "prompt" | null;
  options: any;
  resolve: ((value: any) => void) | null;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({
    kind: null,
    options: null,
    resolve: null,
  });

  const close = useCallback((result: any) => {
    setState((prev) => {
      prev.resolve?.(result);
      return { kind: null, options: null, resolve: null };
    });
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ kind: "confirm", options, resolve });
    });
  }, []);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setState({ kind: "alert", options, resolve: () => resolve() });
    });
  }, []);

  const prompt = useCallback(
    (options: PromptOptions): Promise<string | null> => {
      return new Promise((resolve) => {
        setState({ kind: "prompt", options, resolve });
      });
    },
    []
  );

  const value = useMemo(
    () => ({ confirm, alert, prompt }),
    [confirm, alert, prompt]
  );

  const renderConfirmDescription = () => {
    if (!state.options) return undefined;
    // description alone is fine — we render details as children if needed
    return state.options.description;
  };

  return (
    <DialogContext.Provider value={value}>
      {children}

      {/* CONFIRM */}
      {state.kind === "confirm" && (
        <ConfirmDialog
          open={true}
          onClose={() => close(false)}
          onConfirm={() => close(true)}
          title={state.options.title}
          description={renderConfirmDescription()}
          confirmLabel={state.options.confirmLabel}
          cancelLabel={state.options.cancelLabel}
          variant={state.options.variant || "warning"}
        />
      )}

      {/* Details block for confirm — rendered below main modal via custom Modal if provided */}
      {/* Note: description-only supports basic text. For lists we use RichConfirmDialog below */}

      {/* ALERT */}
      {state.kind === "alert" && (
        <AlertDialog
          open={true}
          onClose={() => close(undefined)}
          title={state.options.title}
          description={state.options.description}
          actionLabel={state.options.actionLabel}
          variant={state.options.variant || "info"}
        />
      )}

      {/* PROMPT */}
      {state.kind === "prompt" && (
        <PromptDialog
          open={true}
          onClose={() => close(null)}
          onSubmit={(v) => close(v)}
          title={state.options.title}
          description={state.options.description}
          placeholder={state.options.placeholder}
          defaultValue={state.options.defaultValue}
          submitLabel={state.options.submitLabel}
          cancelLabel={state.options.cancelLabel}
          variant={state.options.variant}
          minLength={state.options.minLength}
          maxLength={state.options.maxLength}
          required={state.options.required}
          multiline={state.options.multiline}
          helperText={state.options.helperText}
        />
      )}
    </DialogContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    // Graceful fallback to native dialogs if provider not mounted
    return {
      confirm: async (options) => window.confirm(
        options.title + (options.description ? "\n\n" + options.description : "")
      ),
      alert: async (options) => {
        window.alert(
          options.title + (options.description ? "\n\n" + options.description : "")
        );
      },
      prompt: async (options) => {
        const result = window.prompt(
          options.title + (options.description ? "\n\n" + options.description : ""),
          options.defaultValue || ""
        );
        return result;
      },
    };
  }
  return ctx;
}