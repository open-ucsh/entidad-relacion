'use client';

import { ChevronDown, FilePlus, ImageDown, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import type { ExportFormat } from '@/components/canvas/hooks/useCanvasExport';

const FORMAT_OPTIONS: { format: ExportFormat; label: string }[] = [
  { format: 'png', label: 'PNG' },
  { format: 'jpeg', label: 'JPEG' },
  { format: 'pdf', label: 'PDF' },
];

/** Clases base compartidas por todos los botones de acción del header. */
const ACTION_BUTTON_CLASSES =
  'flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';

interface HeaderActionsProps {
  onExport: (format: ExportFormat) => void;
}

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

/** Botón de acción genérico del header (icono + etiqueta). */
function ActionButton({ icon: Icon, label, onClick, disabled }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`${ACTION_BUTTON_CLASSES} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  );
}

/**
 * Menú desplegable para exportar el diagrama en distintos formatos.
 * Implementa el patrón ARIA "menu button": cierra con click afuera o
 * con Escape, y devuelve el foco al trigger al cerrarse.
 */
function ExportMenu({ onExport }: HeaderActionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      }
    }

    window.addEventListener('pointerdown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={ACTION_BUTTON_CLASSES}
      >
        <ImageDown size={16} aria-hidden="true" />
        Exportar
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Formatos de exportación"
          className="absolute right-0 top-full z-40 mt-1 w-32 overflow-hidden rounded-md border border-border bg-background shadow-lg"
        >
          {FORMAT_OPTIONS.map((option) => (
            <button
              key={option.format}
              type="button"
              role="menuitem"
              onClick={() => {
                onExport(option.format);
                close();
              }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-text hover:bg-surface-hover"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function HeaderActions({ onExport }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* TODO: conectar a la acción real de "nuevo diagrama" */}
      <ActionButton icon={FilePlus} label="Nuevo" disabled />

      <ExportMenu onExport={onExport} />
    </div>
  );
}
