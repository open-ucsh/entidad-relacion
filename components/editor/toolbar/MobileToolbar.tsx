'use client';

import {
  ChevronUp,
  Diamond,
  MousePointer2,
  MoveRight,
  Circle,
  Square,
  Trash2,
  Triangle,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useDiagramTool } from '@/components/editor/hooks/useDiagramTool';
import type { Tool } from '@/domain/diagram/models';
import { useDiagramStore } from '@/state/diagram/store';

interface MobileToolbarProps {
  onOpenInspector: () => void;
}

interface MobileTool {
  id: Tool;
  label: string;
  icon: typeof Square;
}

const MAIN_TOOLS: MobileTool[] = [
  {
    id: 'select',
    label: 'Mover',
    icon: MousePointer2,
  },
  {
    id: 'entity',
    label: 'Entidad',
    icon: Square,
  },
  {
    id: 'relationship',
    label: 'Relación',
    icon: Diamond,
  },
  {
    id: 'attribute',
    label: 'Atributo',
    icon: Circle,
  },
  {
    id: 'connect',
    label: 'Conectar',
    icon: MoveRight,
  },
];

const MORE_TOOLS: MobileTool[] = [
  {
    id: 'isa',
    label: 'ISA',
    icon: Triangle,
  },
  {
    id: 'delete',
    label: 'Borrar',
    icon: Trash2,
  },
];

export function MobileToolbar({ onOpenInspector }: MobileToolbarProps) {
  const activeTool = useDiagramStore((state) => state.activeTool);

  const { activateTool } = useDiagramTool();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMoreOpen) {
      return;
    }

    function handleOutsidePointer(event: globalThis.PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }

    window.addEventListener('pointerdown', handleOutsidePointer);

    return () => {
      window.removeEventListener('pointerdown', handleOutsidePointer);
    };
  }, [isMoreOpen]);

  function handleTool(tool: Tool) {
    activateTool(tool);
    setIsMoreOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative z-40 shrink-0 border-t border-border bg-background lg:hidden"
    >
      {isMoreOpen && (
        <div className="absolute bottom-full right-2 mb-2 w-52 overflow-hidden rounded-xl border border-border bg-background p-2 shadow-xl">
          <div className="mb-1 flex items-center justify-between px-2 py-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Más herramientas
            </span>

            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => {
                setIsMoreOpen(false);
              }}
              className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text"
            >
              <X size={16} />
            </button>
          </div>

          {MORE_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  handleTool(tool.id);
                }}
                className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text hover:bg-surface-hover'
                }`}
              >
                <Icon size={19} strokeWidth={1.7} />

                {tool.label}
              </button>
            );
          })}

          <div className="my-2 border-t border-border" />

          <button
            type="button"
            onClick={() => {
              setIsMoreOpen(false);
              onOpenInspector();
            }}
            className="flex h-11 w-full items-center rounded-lg px-3 text-sm font-medium text-text hover:bg-surface-hover"
          >
            Propiedades
          </button>
        </div>
      )}

      <div className="grid h-16 grid-cols-6 pb-[env(safe-area-inset-bottom)]">
        {MAIN_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const active = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              aria-label={tool.label}
              aria-pressed={active}
              onClick={() => {
                handleTool(tool.id);
              }}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 transition-colors ${
                active ? 'text-brand-primary' : 'text-text-muted active:bg-surface-hover'
              }`}
            >
              <Icon size={21} strokeWidth={active ? 2 : 1.7} />

              <span className="max-w-full truncate px-1 text-[10px] font-medium">{tool.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          aria-label="Más herramientas"
          aria-expanded={isMoreOpen}
          onClick={() => {
            setIsMoreOpen((current) => !current);
          }}
          className={`flex min-w-0 flex-col items-center justify-center gap-1 transition-colors ${
            isMoreOpen ? 'text-brand-primary' : 'text-text-muted active:bg-surface-hover'
          }`}
        >
          <ChevronUp size={21} />

          <span className="text-[10px] font-medium">Más</span>
        </button>
      </div>
    </div>
  );
}
