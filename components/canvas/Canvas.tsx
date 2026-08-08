'use client';

import { useEffect, useRef } from 'react';

import type { Diagram } from '@/domain/models';
import { findElementById } from '@/domain/queries';
import { useDiagramStore } from '@/state/diagram-store';

import { CanvasGrid } from './CanvasGrid';
import { CanvasInteraction } from './CanvasInteraction';
import { CanvasLayers } from './CanvasLayers';

import { useCanvasDrag } from './hooks/useCanvasDrag';
import { useCanvasExport } from './hooks/useCanvasExport';
import { useCanvasKeyboard } from './hooks/useCanvasKeyboard';
import { useSvgCoordinates } from './hooks/useSvgCoordinates';

interface CanvasProps {
  diagram: Diagram;
}

const ELEMENT_TYPE_LABELS: Record<string, string> = {
  entity: 'Entidad',
  relationship: 'Relación',
  attribute: 'Atributo',
};

export function Canvas({ diagram }: CanvasProps) {
  const activeTool = useDiagramStore((state) => state.activeTool);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const connectionSourceId = useDiagramStore((state) => state.connectionSourceId);

  const removeElement = useDiagramStore((state) => state.removeElement);
  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);
  const clearSelection = useDiagramStore((state) => state.clearSelection);
  const updateElement = useDiagramStore((state) => state.updateElement);
  const handleConnectClick = useDiagramStore((state) => state.handleConnectClick);
  const setExportHandler = useDiagramStore((state) => state.setExportHandler);

  useCanvasKeyboard();

  const { getSvgPoint } = useSvgCoordinates(svgRef);

  const { startDrag, drag, stopDrag } = useCanvasDrag({
    diagram,
    getSvgPoint,
    updateElement,
  });

  const { exportDiagram } = useCanvasExport(svgRef);

  useEffect(() => {
    setExportHandler((format) => {
      void exportDiagram(format);
    });

    return () => {
      setExportHandler(null);
    };
  }, [setExportHandler, exportDiagram]);

  const selectedElement = selectedElementId
    ? findElementById(diagram, selectedElementId)
    : undefined;
  const isConnectionSelected =
    !selectedElement &&
    selectedElementId !== null &&
    diagram.connections.some((connection) => connection.id === selectedElementId);

  return (
    <main className="relative h-full min-h-0 min-w-0 overflow-hidden">
      <svg ref={svgRef} className="block h-full w-full" onPointerMove={drag} onPointerUp={stopDrag}>
        <CanvasGrid />

        <CanvasInteraction onBackgroundClick={clearSelection}>
          <CanvasLayers
            diagram={diagram}
            selectedElementId={selectedElementId}
            connectionSourceId={connectionSourceId}
            activeTool={activeTool}
            onSelectElement={setSelectedElement}
            onDeleteElement={removeElement}
            onElementPointerDown={startDrag}
            onConnectClick={handleConnectClick}
          />
        </CanvasInteraction>
      </svg>

      <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs text-text-muted shadow-sm backdrop-blur">
        {selectedElement ? (
          <span>
            <span className="font-semibold text-text">
              {ELEMENT_TYPE_LABELS[selectedElement.type]}
            </span>
            {' · '}
            {selectedElement.name}
            {' · '}
            x: {Math.round(selectedElement.position.x)}, y: {Math.round(selectedElement.position.y)}
          </span>
        ) : isConnectionSelected ? (
          <span className="font-semibold text-text">Conexión seleccionada</span>
        ) : (
          <span>
            {diagram.entities.length} entidades · {diagram.relationships.length} relaciones ·{' '}
            {diagram.attributes.length} atributos · {diagram.connections.length} conexiones
          </span>
        )}
      </div>
    </main>
  );
}
