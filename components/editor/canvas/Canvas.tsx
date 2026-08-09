'use client';

import { useRef, useState, type PointerEvent, type RefObject } from 'react';

import { useCreateDiagramElement } from '@/components/editor/hooks/useCreateDiagramElement';
import type { Diagram, Point, Tool } from '@/domain/diagram/models';
import { findDiagramElement, getElementPosition } from '@/domain/diagram/queries/elements';
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

interface ConnectionPreview {
  from: Point;
  to: Point;
}

function isCreatableTool(tool: Tool): tool is 'entity' | 'relationship' | 'attribute' {
  return tool === 'entity' || tool === 'relationship' || tool === 'attribute';
}

function getElementIdAtPoint(clientX: number, clientY: number): string | null {
  const target = document.elementFromPoint(clientX, clientY);

  if (!(target instanceof Element)) {
    return null;
  }

  return (
    target.closest('[data-diagram-element-id]')?.getAttribute('data-diagram-element-id') ?? null
  );
}

export function Canvas({ diagram, svgRef }: CanvasProps) {
  const activeTool = useDiagramStore((state) => state.activeTool);
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const selectedElementIds = useDiagramStore((state) => state.selectedElementIds);
  const connectionSourceId = useDiagramStore((state) => state.connectionSourceId);

  const setActiveTool = useDiagramStore((state) => state.setActiveTool);
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

  const beginConnection = useDiagramStore((state) => state.beginConnection);
  const cancelConnection = useDiagramStore((state) => state.cancelConnection);
  const connectElements = useDiagramStore((state) => state.connectElements);
  const handleConnectClick = useDiagramStore((state) => state.handleConnectClick);

  const { createDiagramElementAt } = useCreateDiagramElement();

  const directConnectionSourceRef = useRef<string | null>(null);
  const [connectionPreview, setConnectionPreview] = useState<ConnectionPreview | null>(null);

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

  const {
    editingElement,
    editingName,
    setEditingName,
    startEditing,
    startEditingElement,
    cancelEditing,
    saveEditing,
  } = useInlineElementNameEditing({
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

  function handleConnectionHandlePointerDown(event: PointerEvent<SVGGElement>, sourceId: string) {
    event.preventDefault();
    event.stopPropagation();

    const from = getElementPosition(diagram, sourceId);
    const to = getWorldPoint(event.nativeEvent);

    if (!from || !to) {
      return;
    }

    directConnectionSourceRef.current = sourceId;
    setConnectionPreview({ from, to });
    beginConnection(sourceId);

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (isCreatableTool(activeTool) && event.button === 0) {
      const point = getWorldPoint(event.nativeEvent);

      if (!point) {
        return;
      }

      const element = createDiagramElementAt(activeTool, point);

      startEditingElement(element);
      setActiveTool('select');

      return;
    }

    const shouldStartSelection = activeTool === 'select' && event.button === 0 && !event.shiftKey;

    if (shouldStartSelection && startSelection(event)) {
      return;
    }

    startPan(event);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const sourceId = directConnectionSourceRef.current;

    if (sourceId) {
      const from = getElementPosition(diagram, sourceId);
      const to = getWorldPoint(event.nativeEvent);

      if (from && to) {
        setConnectionPreview({ from, to });
      }

      return;
    }

    pan(event);
    drag(event);
    updateSelection(event);
  }

  function handlePointerUp(event: PointerEvent<SVGSVGElement>) {
    const sourceId = directConnectionSourceRef.current;

    if (sourceId) {
      const targetId = getElementIdAtPoint(event.clientX, event.clientY);

      if (targetId && targetId !== sourceId) {
        connectElements(sourceId, targetId);
      }

      directConnectionSourceRef.current = null;
      setConnectionPreview(null);
      cancelConnection();

      return;
    }

    stopPan();
    stopDrag();
    finishSelection(event);
  }

  function handlePointerCancel() {
    if (directConnectionSourceRef.current) {
      directConnectionSourceRef.current = null;
      setConnectionPreview(null);
      cancelConnection();
    }

    stopPan();
    stopDrag();
    cancelSelection();
  }

  return (
    <main className="relative min-h-0 flex-1 overflow-hidden">
      <svg
        ref={svgRef}
        className={`block h-full w-full touch-none ${
          isPanning
            ? 'cursor-grabbing'
            : isCreatableTool(activeTool)
              ? 'cursor-crosshair'
              : activeTool === 'select'
                ? 'cursor-default'
                : 'cursor-grab'
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
        <CanvasGrid camera={camera} canvasSize={canvasSize} />

        <CanvasInteraction>
          <g
            id="diagram-world"
            transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}
          >
            {connectionPreview && (
              <g pointerEvents="none">
                <line
                  x1={connectionPreview.from.x}
                  y1={connectionPreview.from.y}
                  x2={connectionPreview.to.x}
                  y2={connectionPreview.to.y}
                  stroke="var(--color-brand-primary)"
                  strokeWidth={2}
                  strokeDasharray="7 5"
                  strokeLinecap="round"
                  opacity={0.9}
                />

                <circle
                  cx={connectionPreview.to.x}
                  cy={connectionPreview.to.y}
                  r={5}
                  fill="var(--color-brand-primary)"
                  opacity={0.9}
                />
              </g>
            )}

            <CanvasLayers
              diagram={diagram}
              selectedElementIds={selectedElementIds}
              connectionSourceId={connectionSourceId}
              activeTool={activeTool}
              onSelectElement={setSelectedElement}
              onToggleElement={toggleSelectedElement}
              onDeleteElement={removeElement}
              onElementPointerDown={startDrag}
              onConnectionHandlePointerDown={handleConnectionHandlePointerDown}
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
