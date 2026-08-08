'use client';

import type { PointerEvent, RefObject } from 'react';

import type { Diagram } from '@/domain/diagram/models';
import { findDiagramElement } from '@/domain/diagram/queries/elements';
import { useDiagramStore } from '@/state/diagram/diagram.store';

import { CanvasGrid } from './CanvasGrid';
import { CanvasInteraction } from './CanvasInteraction';
import { CanvasLayers } from './CanvasLayers';
import { CanvasStatus } from './CanvasStatus';
import { InlineElementNameEditor } from './InlineElementNameEditor';
import { ZoomControls } from './ZoomControls';

import { useCanvasCamera } from './hooks/useCanvasCamera';
import { useCanvasDrag } from './hooks/useCanvasDrag';
import { useCanvasKeyboard } from './hooks/useCanvasKeyboard';
import { useCanvasSelectionBox } from './hooks/useCanvasSelectionBox';
import { useInlineElementNameEditing } from './hooks/useInlineElementNameEditing';
import { useWorldCoordinates } from './hooks/useWorldCoordinates';

interface CanvasProps {
  diagram: Diagram;
  svgRef: RefObject<SVGSVGElement | null>;
}

export function Canvas({ diagram, svgRef }: CanvasProps) {
  const activeTool = useDiagramStore((state) => state.activeTool);
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const selectedElementIds = useDiagramStore((state) => state.selectedElementIds);
  const connectionSourceId = useDiagramStore((state) => state.connectionSourceId);

  const removeElement = useDiagramStore((state) => state.removeElement);
  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);
  const setSelectedElements = useDiagramStore((state) => state.setSelectedElements);
  const toggleSelectedElement = useDiagramStore((state) => state.toggleSelectedElement);
  const clearSelection = useDiagramStore((state) => state.clearSelection);
  const updateElement = useDiagramStore((state) => state.updateElement);
  const moveElements = useDiagramStore((state) => state.moveElements);
  const beginHistoryTransaction = useDiagramStore((state) => state.beginHistoryTransaction);
  const completeHistoryTransaction = useDiagramStore((state) => state.completeHistoryTransaction);
  const cancelHistoryTransaction = useDiagramStore((state) => state.cancelHistoryTransaction);
  const handleConnectClick = useDiagramStore((state) => state.handleConnectClick);

  useCanvasKeyboard();

  const {
    canvasSize,
    camera,
    isPanning,
    handleWheel,
    startPan,
    pan,
    stopPan,
    zoomIn,
    zoomOut,
    resetView,
    fitToDiagram,
    zoomPercentage,
    canZoomIn,
    canZoomOut,
  } = useCanvasCamera(svgRef);

  const { getWorldPoint } = useWorldCoordinates(svgRef, camera);

  const { startDrag, drag, stopDrag } = useCanvasDrag({
    diagram,
    selectedElementIds,
    getSvgPoint: getWorldPoint,
    moveElements,
    onMoveStarted: beginHistoryTransaction,
    onMoveCompleted: (movedElementCount) => {
      completeHistoryTransaction(
        'elements-moved',
        `Se movió ${movedElementCount} elemento${movedElementCount === 1 ? '' : 's'}.`,
      );
    },
    onMoveCancelled: cancelHistoryTransaction,
  });

  const { selectionBox, startSelection, updateSelection, finishSelection, cancelSelection } =
    useCanvasSelectionBox({
      diagram,
      svgRef,
      canvasSize,
      camera,
      selectedElementIds,
      setSelectedElements,
      clearSelection,
    });

  const { editingElement, editingName, setEditingName, startEditing, cancelEditing, saveEditing } =
    useInlineElementNameEditing({
      diagram,
      onSelectElement: setSelectedElement,
      updateElement,
    });

  const selectedElement = selectedElementId
    ? findDiagramElement(diagram, selectedElementId)
    : undefined;

  const isConnectionSelected =
    selectedElementId !== null &&
    diagram.connections.some((connection) => connection.id === selectedElementId);

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    const shouldStartSelection = activeTool === 'select' && event.button === 0 && !event.shiftKey;

    if (shouldStartSelection && startSelection(event)) {
      return;
    }

    startPan(event);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    pan(event);
    drag(event);
    updateSelection(event);
  }

  function handlePointerUp(event: PointerEvent<SVGSVGElement>) {
    stopPan();
    stopDrag();
    finishSelection(event);
  }

  function handlePointerCancel() {
    stopPan();
    stopDrag();
    cancelSelection();
  }

  return (
    <main className="relative h-full min-h-0 overflow-hidden">
      <svg
        ref={svgRef}
        className={`block h-full w-full touch-none ${
          isPanning ? 'cursor-grabbing' : activeTool === 'select' ? 'cursor-default' : 'cursor-grab'
        }`}
        viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        role="application"
        aria-label="Lienzo del diagrama Entidad-Relación"
      >
        <CanvasInteraction>
          <CanvasGrid camera={camera} canvasSize={canvasSize} />

          <g
            id="diagram-world"
            transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}
          >
            <CanvasLayers
              diagram={diagram}
              selectedElementIds={selectedElementIds}
              connectionSourceId={connectionSourceId}
              activeTool={activeTool}
              onSelectElement={setSelectedElement}
              onToggleElement={toggleSelectedElement}
              onDeleteElement={removeElement}
              onElementPointerDown={startDrag}
              onConnectClick={handleConnectClick}
              onEditElement={startEditing}
            />

            {editingElement && (
              <InlineElementNameEditor
                element={editingElement}
                value={editingName}
                onChange={setEditingName}
                onCommit={saveEditing}
                onCancel={cancelEditing}
              />
            )}
          </g>

          {selectionBox && (
            <rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="var(--color-brand-primary)"
              fillOpacity={0.1}
              stroke="var(--color-brand-primary)"
              strokeWidth={1}
              strokeDasharray="5 4"
              pointerEvents="none"
            />
          )}
        </CanvasInteraction>
      </svg>

      <ZoomControls
        zoomPercentage={zoomPercentage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetView}
        onFitToView={() => {
          fitToDiagram(diagram);
        }}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
      />

      <CanvasStatus
        diagram={diagram}
        selectedElement={selectedElement}
        selectedElementCount={selectedElementIds.length}
        isConnectionSelected={isConnectionSelected}
      />
    </main>
  );
}
