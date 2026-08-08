'use client';

import { useCallback, useRef, useState, type RefObject } from 'react';

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
  const selectedElementIds = useDiagramStore((state) => state.selectedElementIds);
  const connectionSourceId = useDiagramStore((state) => state.connectionSourceId);

  const removeElement = useDiagramStore((state) => state.removeElement);
  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);
  const toggleSelectedElement = useDiagramStore((state) => state.toggleSelectedElement);
  const clearSelection = useDiagramStore((state) => state.clearSelection);
  const updateElement = useDiagramStore((state) => state.updateElement);
  const handleConnectClick = useDiagramStore((state) => state.handleConnectClick);

  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const skipNameCommitRef = useRef(false);

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
    selectedElementIds,
    getSvgPoint,
    updateElement,
  });

  const selectedElement = selectedElementId
    ? findElementById(diagram, selectedElementId)
    : undefined;

  const editingElement = editingElementId ? findElementById(diagram, editingElementId) : undefined;

  const isConnectionSelected =
    selectedElementId !== null &&
    diagram.connections.some((connection) => connection.id === selectedElementId);

  function startEditing(id: string) {
    const element = findElementById(diagram, id);

    if (!element) {
      return;
    }

    skipNameCommitRef.current = false;
    setSelectedElement(id);
    setEditingName(element.name);
    setEditingElementId(id);
  }

  function cancelEditing() {
    skipNameCommitRef.current = true;
    setEditingElementId(null);
  }

  function saveEditing() {
    if (skipNameCommitRef.current) {
      skipNameCommitRef.current = false;
      return;
    }

    const name = editingName.trim();

    if (editingElementId && name) {
      updateElement(editingElementId, { name });
    }

    setEditingElementId(null);
  }

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
              selectedElementIds={selectedElementIds}
              connectionSourceId={connectionSourceId}
              activeTool={activeTool}
              onSelectElement={setSelectedElement}
              onToggleElement={toggleSelectedElement}
              onDeleteElement={removeElement}
              onElementPointerDown={(event, id) => {
                startDrag(event, id);
              }}
              onConnectClick={handleConnectClick}
              onEditElement={startEditing}
            />

            {editingElement && (
              <foreignObject
                x={editingElement.position.x - 58}
                y={editingElement.position.y - 17}
                width="116"
                height="34"
              >
                <input
                  autoFocus
                  value={editingName}
                  onChange={(event) => {
                    setEditingName(event.target.value);
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.currentTarget.blur();
                    }

                    if (event.key === 'Escape') {
                      cancelEditing();
                    }
                  }}
                  onBlur={saveEditing}
                  className="h-full w-full rounded border border-brand-primary bg-background px-2 text-center text-xs font-semibold text-text outline-none"
                />
              </foreignObject>
            )}
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
            {selectedElementIds.length > 1
              ? `${selectedElementIds.length} elementos seleccionados`
              : `${diagram.entities.length} entidades · ${diagram.relationships.length} relaciones · ${diagram.attributes.length} atributos · ${diagram.connections.length} conexiones`}
          </span>
        )}
      </div>
    </main>
  );
}
