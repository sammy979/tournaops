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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: ((value: any) => void) | null;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({
    kind: null,
    options: null,
    resolve: null,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const close = useCallback((result: any) => {
    setState((prev) => {
      prev.resolve?.(result);
      return { kind: null, options: null, resolve: null };
    });
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> =>
      new Promise((resolve) => {
        setState({ kind: "confirm", options, resolve });
      }),
    []
  );

  const alert = useCallback(
    (options: AlertOptions): Promise<void> =>
      new Promise((resolve) => {
        setState({ kind: "alert", options, resolve: () => resolve() });
      }),
    []
  );

  const prompt = useCallback(
    (options: PromptOptions): Promise<string | null> =>
      new Promise((resolve) => {
        setState({ kind: "prompt", options, resolve });
      }),
    []
  );

  const value = useMemo(
    () => ({ confirm, alert, prompt }),
    [confirm, alert, prompt]
  );

  return (
    <DialogContext.Provider value={value}>
      {children}

      {state.kind === "confirm" && (
        <ConfirmDialog
          open={true}
          onClose={() => close(false)}
          onConfirm={() => close(true)}
          title={state.options.title}
          description={state.options.description}
          confirmLabel={state.options.confirmLabel}
          cancelLabel={state.options.cancelLabel}
          variant={state.options.variant || "warning"}
        />
      )}

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
// HOOK — throws if DialogProvider is not mounted
// Native browser dialogs are NEVER used as fallback
// ============================================================

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error(
      "[TournaOps] useDialog() must be used inside <DialogProvider>. " +
        "Ensure DialogProvider is mounted in your root layout. " +
        "Native browser dialogs (window.confirm/alert/prompt) are not permitted."
    );
  }
  return ctx;
}
