"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

// ============================================================
// TYPES
// ============================================================

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export type ModalVariant = "default" | "danger" | "success" | "warning" | "info";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  className?: string;
  hideCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
}

// ============================================================
// SIZE + VARIANT MAPS
// ============================================================

const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw]",
};

const variantMap: Record<ModalVariant, {
  border: string;
  iconBg: string;
  iconColor: string;
  headerBg: string;
  defaultIcon: React.ReactNode;
}> = {
  default: {
    border: "border-white/10",
    iconBg: "bg-white/5",
    iconColor: "text-gray-400",
    headerBg: "",
    defaultIcon: null,
  },
  danger: {
    border: "border-red-500/25",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    headerBg: "bg-gradient-to-b from-red-500/8 to-transparent",
    defaultIcon: <AlertTriangle className="w-5 h-5" />,
  },
  success: {
    border: "border-green-500/25",
    iconBg: "bg-green-500/15",
    iconColor: "text-green-400",
    headerBg: "bg-gradient-to-b from-green-500/8 to-transparent",
    defaultIcon: <CheckCircle className="w-5 h-5" />,
  },
  warning: {
    border: "border-amber-500/25",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    headerBg: "bg-gradient-to-b from-amber-500/8 to-transparent",
    defaultIcon: <AlertCircle className="w-5 h-5" />,
  },
  info: {
    border: "border-blue-500/25",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    headerBg: "bg-gradient-to-b from-blue-500/8 to-transparent",
    defaultIcon: <Info className="w-5 h-5" />,
  },
};

// ============================================================
// CORE MODAL
// ============================================================

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  variant = "default",
  className,
  hideCloseButton = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  icon,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!closeOnEscape) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  // Focus trap — cycle Tab within modal
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !modalRef.current) return;
    const focusables = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  // Mount / unmount with animation
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setMounted(true);
      requestAnimationFrame(() => setAnimating(true));
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keydown", handleTabKey);
      // Focus first focusable element after animation
      setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
          );
          firstFocusable?.focus();
        }
      }, 100);
    } else if (mounted) {
      setAnimating(false);
      const timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = "";
        previousActiveElement.current?.focus();
      }, 180);
      return () => clearTimeout(timer);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleTabKey);
      document.body.style.overflow = "";
    };
  }, [open, mounted, handleKeyDown, handleTabKey]);

  if (!mounted) return null;

  const v = variantMap[variant];
  const displayIcon = icon !== undefined ? icon : v.defaultIcon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-200",
          animating ? "opacity-100" : "opacity-0"
        )}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full rounded-2xl border bg-[#0d0d14] shadow-2xl shadow-black/60",
          "max-h-[92vh] flex flex-col",
          "transition-all duration-200 ease-out",
          animating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2",
          v.border,
          sizeMap[size],
          className
        )}
      >
        {/* Header */}
        {(title || description || displayIcon) && (
          <div
            className={cn(
              "flex items-start gap-3 p-5 sm:p-6 border-b border-white/8",
              v.headerBg
            )}
          >
            {displayIcon && (
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                  v.iconBg,
                  v.iconColor
                )}
              >
                {displayIcon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-white font-bold text-lg sm:text-xl leading-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="text-gray-400 text-sm mt-1.5 leading-relaxed"
                >
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="flex-shrink-0 -mr-1 -mt-1 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Close button if no header */}
        {!title && !description && !displayIcon && !hideCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 flex items-center justify-end gap-2 p-4 sm:p-5 border-t border-white/8 bg-black/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CONFIRM DIALOG — replaces window.confirm()
// ============================================================

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info" | "default";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning",
  loading = false,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const confirmColor =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600 text-white"
      : variant === "warning"
      ? "bg-amber-500 hover:bg-amber-600 text-black"
      : "bg-blue-500 hover:bg-blue-600 text-white";

  const isDisabled = busy || loading;

  return (
    <Modal
      open={open}
      onClose={isDisabled ? () => {} : onClose}
      title={title}
      description={description}
      variant={variant === "default" ? "info" : variant}
      size="sm"
      closeOnBackdrop={!isDisabled}
      closeOnEscape={!isDisabled}
      hideCloseButton={isDisabled}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isDisabled}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDisabled}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
              confirmColor
            )}
          >
            {isDisabled ? "Working..." : confirmLabel}
          </button>
        </>
      }
    >
      <div />
    </Modal>
  );
}

// ============================================================
// ALERT DIALOG — replaces window.alert()
// ============================================================

export interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  actionLabel?: string;
  variant?: ModalVariant;
}

export function AlertDialog({
  open,
  onClose,
  title,
  description,
  actionLabel = "OK",
  variant = "info",
}: AlertDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      variant={variant}
      size="sm"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-bold bg-white/10 hover:bg-white/15 text-white transition-colors"
        >
          {actionLabel}
        </button>
      }
    >
      <div />
    </Modal>
  );
}

// ============================================================
// PROMPT DIALOG — replaces window.prompt() with rich UX
// ============================================================

export interface PromptDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void | Promise<void>;
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

export function PromptDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  placeholder,
  defaultValue = "",
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  variant = "info",
  minLength = 0,
  maxLength = 500,
  required = true,
  multiline = false,
  helperText,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setTouched(false);
    }
  }, [open, defaultValue]);

  const trimmed = value.trim();
  const isValid =
    (!required || trimmed.length > 0) &&
    trimmed.length >= minLength &&
    trimmed.length <= maxLength;

  const errorMessage = touched && !isValid
    ? required && trimmed.length === 0
      ? "This field is required"
      : trimmed.length < minLength
      ? `Minimum ${minLength} characters required (currently ${trimmed.length})`
      : `Maximum ${maxLength} characters (currently ${trimmed.length})`
    : null;

  const handleSubmit = async () => {
    setTouched(true);
    if (!isValid) return;
    setBusy(true);
    try {
      await onSubmit(trimmed);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const inputClasses = cn(
    "w-full px-3 py-2.5 rounded-lg bg-black/40 border text-white text-sm",
    "focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors",
    errorMessage
      ? "border-red-500/50 focus:border-red-500/70"
      : "border-white/10 focus:border-white/20"
  );

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      description={description}
      variant={variant}
      size="md"
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
      hideCloseButton={busy}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy || !isValid}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? "Working..." : submitLabel}
          </button>
        </>
      }
    >
      <div className="space-y-2">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={placeholder}
            maxLength={maxLength + 50}
            disabled={busy}
            rows={4}
            className={cn(inputClasses, "resize-y min-h-[100px]")}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={placeholder}
            maxLength={maxLength + 50}
            disabled={busy}
            className={inputClasses}
            autoFocus
          />
        )}
        <div className="flex items-center justify-between text-xs">
          <span className={errorMessage ? "text-red-400" : "text-gray-500"}>
            {errorMessage || helperText || " "}
          </span>
          <span
            className={cn(
              "font-mono",
              trimmed.length > maxLength
                ? "text-red-400"
                : trimmed.length >= minLength
                ? "text-gray-500"
                : "text-amber-400"
            )}
          >
            {trimmed.length}
            {maxLength ? ` / ${maxLength}` : ""}
          </span>
        </div>
      </div>
    </Modal>
  );
}