'use client';

import { useRef } from 'react';

import type { Diagram } from '@/domain/models';
import { useDiagramStore } from '@/state/diagram-store';

import { CanvasGrid } from './CanvasGrid';
import { CanvasInteraction } from './CanvasInteraction';
import { CanvasLayers } from './CanvasLayers';

import { useCanvasDrag } from './hooks/useCanvasDrag';
import { useCanvasKeyboard } from './hooks/useCanvasKeyboard';
import { useSvgCoordinates } from './hooks/useSvgCoordinates';
import { useCanvasConnect } from './hooks/useCanvasConnect';
interface CanvasProps {
  diagram: Diagram;
}

export function Canvas({ diagram }: CanvasProps) {
  const activeTool = useDiagramStore((state) => state.activeTool);

  const { connect } = useCanvasConnect();

  const svgRef = useRef<SVGSVGElement | null>(null);

  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const removeElement = useDiagramStore((state) => state.removeElement);

  const removeConnection = useDiagramStore((state) => state.removeConnection);

  const selectedConnectionId = useDiagramStore((state) => state.selectedConnectionId);

  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);

  const setSelectedConnection = useDiagramStore((state) => state.setSelectedConnection);

  const updateElement = useDiagramStore((state) => state.updateElement);

  useCanvasKeyboard();

  const { getSvgPoint } = useSvgCoordinates(svgRef);

  const { startDrag, drag, stopDrag } = useCanvasDrag({
    diagram,
    getSvgPoint,
    updateElement,
  });

  return (
    <main className="relative min-h-0 overflow-hidden bg-surface">
      <svg
        ref={svgRef}
        className="h-full w-full select-none"
        onPointerMove={drag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <CanvasGrid />

        <CanvasInteraction>
          <CanvasLayers
            diagram={diagram}
            selectedElementId={selectedElementId}
            selectedConnectionId={selectedConnectionId}
            activeTool={activeTool}
            onSelectElement={setSelectedElement}
            onSelectConnection={setSelectedConnection}
            onConnect={connect}
            onDeleteElement={removeElement}
            onDeleteConnection={removeConnection}
            onElementPointerDown={startDrag}
          />
        </CanvasInteraction>
      </svg>

      <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs text-text-muted shadow-sm backdrop-blur">
        {diagram.entities.length} entidades · {diagram.relationships.length} relaciones ·{' '}
        {diagram.attributes.length} atributos
      </div>
    </main>
  );
}
