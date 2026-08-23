'use client';

import { AlertTriangle } from 'lucide-react';

import { useCloseOnEscape } from '../hooks/useCloseOnEscape';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useCloseOnEscape({ isOpen, onClose: onCancel });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-text/35 backdrop-blur-sm"
        aria-label="Cancelar"
        onClick={onCancel}
      />

      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
          <AlertTriangle size={19} aria-hidden="true" />
        </span>

        <h2 id="confirm-dialog-title" className="mt-4 text-lg font-semibold text-text">
          {title}
        </h2>

        <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-text-muted">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
