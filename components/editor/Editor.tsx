'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

import { useCanvasExport } from '@/components/canvas/hooks/useCanvasExport';
import { Canvas } from '@/components/canvas/Canvas';
import { Header } from '@/components/header/Header';
import { Inspector } from '@/components/inspector/Inspector';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { useDiagramStore } from '@/state/diagram-store';

const TOOLBAR_WIDTH = '240px';
const INSPECTOR_WIDTH = '320px';

function getWorkspaceColumns(toolbarOpen: boolean, inspectorOpen: boolean): string {
  const toolbarWidth = toolbarOpen ? TOOLBAR_WIDTH : '0px';
  const inspectorWidth = inspectorOpen ? INSPECTOR_WIDTH : '0px';

  return `${toolbarWidth} minmax(0, 1fr) ${inspectorWidth} `;
}

export function Editor() {
  const diagram = useDiagramStore((state) => state.diagram);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const { exportDiagram } = useCanvasExport(svgRef);

  const [toolbarOpen, setToolbarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const workspaceColumns = getWorkspaceColumns(toolbarOpen, inspectorOpen);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Header
        onExport={(format) => {
          void exportDiagram(format);
        }}
      />

      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        <div
          className="grid h-full min-h-0 min-w-0 flex-1 overflow-hidden transition-[grid-template-columns] duration-200 ease-out"
          style={{ gridTemplateColumns: workspaceColumns }}
        >
          <div
            className={[
              'h-full min-h-0 min-w-0 overflow-hidden',
              'transition-opacity duration-150',
              toolbarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
            ].join(' ')}
          >
            <Toolbar />
          </div>

          <div className="relative h-full min-h-0 min-w-0 overflow-hidden">
            <Canvas diagram={diagram} svgRef={svgRef} />
          </div>

          <div
            className={[
              'h-full min-h-0 min-w-0 overflow-hidden',
              'transition-opacity duration-150',
              inspectorOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
            ].join(' ')}
          >
            <Inspector />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setToolbarOpen((open) => !open);
          }}
          aria-label={toolbarOpen ? 'Ocultar herramientas' : 'Mostrar herramientas'}
          className={[
            'absolute top-1/2 z-30',
            'flex h-10 w-7 -translate-y-1/2',
            'items-center justify-center',
            'border border-border bg-background',
            'text-text-muted shadow-sm',
            'transition-[left] duration-200',
            'hover:bg-surface-hover hover:text-text',
            'focus-visible:outline-none',
            'focus-visible:ring-2 focus-visible:ring-brand-primary/40',
            toolbarOpen ? 'left-60 rounded-r-md' : 'left-0 rounded-r-md',
          ].join(' ')}
        >
          {toolbarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <button
          type="button"
          onClick={() => {
            setInspectorOpen((open) => !open);
          }}
          aria-label={inspectorOpen ? 'Ocultar inspector' : 'Mostrar inspector'}
          className={[
            'absolute top-1/2 z-30',
            'flex h-10 w-7 -translate-y-1/2',
            'items-center justify-center',
            'border border-border bg-background',
            'text-text-muted shadow-sm',
            'transition-[right] duration-200',
            'hover:bg-surface-hover hover:text-text',
            'focus-visible:outline-none',
            'focus-visible:ring-2 focus-visible:ring-brand-primary/40',
            inspectorOpen ? 'right-80 rounded-l-md' : 'right-0 rounded-l-md',
          ].join(' ')}
        >
          {inspectorOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </main>
    </div>
  );
}
