'use client';

import {
  ChevronUp,
  Circle,
  Diamond,
  MoreHorizontal,
  MousePointer2,
  MoveRight,
  SlidersHorizontal,
  Square,
  Trash2,
  Triangle,
  X,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

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
    label: 'Seleccionar',
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
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);
  const morePanelRef = useRef<HTMLDivElement | null>(null);
  const morePanelId = useId();

  const isMoreToolActive = MORE_TOOLS.some((tool) => tool.id === activeTool);

  useEffect(() => {
    if (!isMoreOpen) {
      return;
    }

    morePanelRef.current?.querySelector<HTMLButtonElement>('button')?.focus();

    function handleOutsidePointer(event: globalThis.PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    }

    window.addEventListener('pointerdown', handleOutsidePointer);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('pointerdown', handleOutsidePointer);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isMoreOpen]);

  function handleTool(tool: Tool) {
    activateTool(tool);
    setIsMoreOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl border border-border bg-background shadow-lg"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsMoreOpen(false);
        }
      }}
    >
      <button
        type="button"
        onClick={() => {
          setIsMoreOpen(false);
          onOpenInspector();
        }}
        className="flex min-h-11 w-full items-center gap-2 rounded-t-2xl border-b border-border px-4 text-left text-xs font-semibold text-brand-primary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary"
      >
        <SlidersHorizontal size={16} aria-hidden="true" />

        <span>Propiedades</span>

        <ChevronUp size={16} aria-hidden="true" className="ml-auto" />
      </button>

      <nav aria-label="Herramientas del diagrama" className="grid grid-cols-6 gap-1 p-2">
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
              className={`flex h-11 min-w-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                active
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-muted hover:bg-surface-hover active:bg-surface-hover'
              }`}
            >
              <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
            </button>
          );
        })}

        <button
          ref={moreButtonRef}
          type="button"
          aria-label="Más herramientas"
          aria-expanded={isMoreOpen}
          aria-controls={morePanelId}
          onClick={() => {
            setIsMoreOpen((open) => !open);
          }}
          className={`flex h-11 min-w-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
            isMoreOpen || isMoreToolActive
              ? 'bg-brand-primary/10 text-brand-primary'
              : 'text-text-muted hover:bg-surface-hover active:bg-surface-hover'
          }`}
        >
          <MoreHorizontal size={21} aria-hidden="true" />
        </button>
      </nav>

      {isMoreOpen && (
        <div
          ref={morePanelRef}
          id={morePanelId}
          className="absolute bottom-full right-0 mb-2 w-52 rounded-xl border border-border bg-background p-2 shadow-lg"
        >
          {MORE_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  handleTool(tool.id);
                }}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                  active
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text hover:bg-surface-hover'
                }`}
              >
                <Icon size={19} strokeWidth={1.7} aria-hidden="true" />

                {tool.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setIsMoreOpen(false);
              moreButtonRef.current?.focus();
            }}
            className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-text-muted transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <X size={18} aria-hidden="true" />
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
