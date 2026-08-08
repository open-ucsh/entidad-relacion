'use client';

import { ChevronDown, FilePlus, ImageDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useDiagramStore } from '@/state/diagram-store';
import type { ExportFormat } from '@/components/canvas/hooks/useCanvasExport';

const FORMAT_OPTIONS: { format: ExportFormat; label: string }[] = [
  { format: 'png', label: 'PNG' },
  { format: 'jpeg', label: 'JPEG' },
  { format: 'pdf', label: 'PDF' },
];

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
    >
      <Icon size={14} strokeWidth={1.75} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function ExportMenu() {
  const exportHandler = useDiagramStore((state) => state.exportHandler);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener('pointerdown', handleClickOutside);
    return () => {
      window.removeEventListener('pointerdown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
        }}
        className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
      >
        <ImageDown size={14} strokeWidth={1.75} />
        <span className="hidden md:inline">Exportar</span>
        <ChevronDown size={12} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 w-32 overflow-hidden rounded-md border border-border bg-background shadow-lg">
          {FORMAT_OPTIONS.map((option) => (
            <button
              key={option.format}
              type="button"
              onClick={() => {
                exportHandler?.(option.format);
                setOpen(false);
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

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ActionButton icon={FilePlus} label="Nuevo" />
      <div className="mx-1 hidden h-6 w-px bg-white/15 sm:block" aria-hidden />
      <ExportMenu />
    </div>
  );
}
