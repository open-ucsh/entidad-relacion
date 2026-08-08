'use client';

import { useCallback, type RefObject } from 'react';

import type { Diagram } from '@/domain/models';
import { findElementById } from '@/domain/queries/elements';
import { useDiagramStore } from '@/state/diagram-store';

import { CanvasGrid } from './CanvasGrid';
import { CanvasInteraction } from './CanvasInteraction';
import { CanvasLayers } from './CanvasLayers';
import { ZoomControls } from './ZoomControls';

import { useCanvasDrag } from './hooks/useCanvasDrag';
import { useCanvasKeyboard } from './hooks/useCanvasKeyboard';
import { useCanvasViewport } from './hooks/useCanvasViewport';
import { useSvgCoordinates } from './hooks/useSvgCoordinates';

interface CanvasProps {
  diagram: Diagram;
  svgRef: RefObject<SVGSVGElement | null>;
}

const ELEMENT_TYPE_LABELS: Record<string, string> = {
  entity: 'Entidad',
  relationship: 'Relación',
  attribute: 'Atributo',
};

export function Canvas({ diagram, svgRef }: CanvasProps) {
  const activeTool = useDiagramStore((state) => state.activeTool);
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const connectionSourceId = useDiagramStore((state) => state.connectionSourceId);

  const removeElement = useDiagramStore((state) => state.removeElement);
  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);
  const clearSelection = useDiagramStore((state) => state.clearSelection);
  const updateElement = useDiagramStore((state) => state.updateElement);
  const handleConnectClick = useDiagramStore((state) => state.handleConnectClick);

  useCanvasKeyboard();

  const {
    canvasSize,
    camera,
    panning,
    handleWheel,
    startPan,
    pan,
    stopPan,
    zoomIn,
    zoomOut,
    resetView,
    zoomPercentage,
    canZoomIn,
    canZoomOut,
  } = useCanvasViewport(svgRef);

  const { getSvgPoint: getScreenPoint } = useSvgCoordinates(svgRef);

  const getSvgPoint = useCallback(
    (event: globalThis.PointerEvent) => {
      const point = getScreenPoint(event);

      if (!point) {
        return null;
      }

      return {
        x: (point.x - camera.x) / camera.zoom,
        y: (point.y - camera.y) / camera.zoom,
      };
    },
    [camera, getScreenPoint],
  );

  const { startDrag, drag, stopDrag } = useCanvasDrag({
    diagram,
    getSvgPoint,
    updateElement,
  });

  const selectedElement = selectedElementId
    ? findElementById(diagram, selectedElementId)
    : undefined;

  const isConnectionSelected =
    !selectedElement &&
    selectedElementId !== null &&
    diagram.connections.some((connection) => connection.id === selectedElementId);

  return (
    <main className="relative h-full min-h-0 min-w-0 overflow-hidden bg-background">
      <svg
        ref={svgRef}
        className={`block h-full w-full touch-none ${panning ? 'cursor-grabbing' : 'cursor-grab'}`}
        viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
        onWheel={handleWheel}
        onPointerDown={startPan}
        onPointerMove={(event) => {
          pan(event);
          drag(event);
        }}
        onPointerUp={() => {
          stopPan();
          stopDrag();
        }}
        onPointerCancel={() => {
          stopPan();
          stopDrag();
        }}
        role="application"
        aria-label="Lienzo del diagrama Entidad-Relación"
      >
        <CanvasInteraction onBackgroundClick={clearSelection}>
          <CanvasGrid camera={camera} canvasSize={canvasSize} />

          <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}>
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
          </g>
        </CanvasInteraction>
      </svg>

      <ZoomControls
        zoomPercentage={zoomPercentage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetView}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
      />

      <div className="pointer-events-none absolute bottom-5 right-5 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs text-text-muted shadow-sm backdrop-blur">
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
