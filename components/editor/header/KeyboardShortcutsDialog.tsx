'use client';

import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  ['V', 'Seleccionar'],
  ['E', 'Crear entidad'],
  ['R', 'Crear relación'],
  ['A', 'Crear atributo'],
  ['C', 'Conectar'],
  ['D', 'Borrar'],
  ['Ctrl/Cmd + A', 'Seleccionar todo'],
  ['Ctrl/Cmd + D', 'Duplicar selección'],
  ['Supr', 'Borrar selección'],
  ['Ctrl/Cmd + Z', 'Deshacer'],
  ['Ctrl/Cmd + Shift + Z', 'Rehacer'],
  ['Ctrl/Cmd + Y', 'Rehacer'],
] as const;

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="absolute inset-0 z-50 flex items-center justify-center bg-text/30 p-4 backdrop-blur-sm"
      onPointerDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
        className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <Keyboard size={18} aria-hidden="true" />
            </span>

            <div>
              <h2 id="keyboard-shortcuts-title" className="text-sm font-semibold text-text">
                Atajos de teclado
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">Trabaja más rápido en el lienzo.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ayuda de atajos"
            className="flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <ul className="divide-y divide-border px-5 py-2">
          {SHORTCUTS.map(([shortcut, description]) => (
            <li key={shortcut} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm text-text">{description}</span>

              <kbd className="rounded border border-border bg-surface px-2 py-1 text-[11px] font-semibold text-text-muted shadow-sm">
                {shortcut}
              </kbd>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
