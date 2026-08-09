'use client';

import { Keyboard, X } from 'lucide-react';
import { useEffect } from 'react';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    category: 'Herramientas',
    items: [
      ['V', 'Seleccionar'],
      ['E', 'Crear entidad'],
      ['R', 'Crear relación'],
      ['A', 'Crear atributo'],
      ['C', 'Conectar'],
      ['D', 'Borrar'],
    ],
  },
  {
    category: 'Edición',
    items: [
      ['Ctrl/Cmd + A', 'Seleccionar todo'],
      ['Ctrl/Cmd + D', 'Duplicar selección'],
      ['Supr', 'Borrar selección'],
    ],
  },
  {
    category: 'Historial',
    items: [
      ['Ctrl/Cmd + Z', 'Deshacer'],
      ['Ctrl/Cmd + Shift + Z', 'Rehacer'],
      ['Ctrl/Cmd + Y', 'Rehacer'],
    ],
  },
] as const;

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-text/30 p-4 backdrop-blur-sm"
      onPointerDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
        className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Keyboard size={19} aria-hidden="true" />
            </span>

            <div>
              <h2
                id="keyboard-shortcuts-title"
                className="text-base font-semibold tracking-tight text-text"
              >
                Atajos de teclado
              </h2>

              <p className="mt-0.5 text-sm text-text-muted">Trabaja más rápido en el lienzo.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ayuda de atajos"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {SHORTCUT_GROUPS.map((group) => (
              <section key={group.category}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {group.category}
                </h3>

                <ul className="overflow-hidden rounded-xl border border-border bg-background">
                  {group.items.map(([shortcut, description]) => (
                    <li
                      key={shortcut}
                      className="flex items-center justify-between gap-4 border-b border-border px-3 py-2.5 last:border-b-0 hover:bg-surface-hover"
                    >
                      <span className="text-sm text-text">{description}</span>

                      <kbd className="whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs font-semibold text-text-muted shadow-sm">
                        {shortcut}
                      </kbd>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <footer className="border-t border-border bg-surface px-6 py-3">
          <p className="text-center text-xs text-text-muted">
            Presiona <kbd className="font-semibold text-text">Escape</kbd> para cerrar esta ventana.
          </p>
        </footer>
      </section>
    </div>
  );
}
