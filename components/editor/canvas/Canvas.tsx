'use client';

import { type PointerEvent, type RefObject } from 'react';
import styles from './Canvas.module.css';

import { useCreateDiagramElement } from '@/components/editor/hooks/useCreateDiagramElement';
import type { Diagram } from '@/domain/diagram/models';
import { findDiagramElement } from '@/domain/diagram/queries/elements';
import { useDiagramStore } from '@/state/diagram/store';

import { CanvasConnectionPreview } from './CanvasConnectionPreview';
import { CanvasGrid } from './CanvasGrid';
import { CanvasLayers } from './CanvasLayers';
import { CanvasStatusBar } from './CanvasStatusBar';
import { InlineElementNameEditor } from './InlineElementNameEditor';
import { SelectionBox } from './SelectionBox';
import { ZoomControls } from './ZoomControls';
import { CanvasAlignmentGuides } from './CanvasAlignmentGuides';

import { useCanvasCamera } from './hooks/useCanvasCamera';
import { useCanvasConnection } from './hooks/useCanvasConnection';
import { useCanvasDrag } from './hooks/useCanvasDrag';

import { useCanvasToolDrop } from './hooks/useCanvasToolDrop';
import { useCanvasKeyboard } from './hooks/useCanvasKeyboard';
import { useCanvasSelectionBox } from './hooks/useCanvasSelectionBox';
import { useInlineElementNameEditing } from './hooks/useInlineElementNameEditing';
import { useWorldCoordinates } from './hooks/useWorldCoordinates';
import { useCanvasAlignmentGuides } from './hooks/useCanvasAlignmentGuides';
import { isCreatableTool } from './lib/canvas-elements';

interface CanvasProps {
  diagram: Diagram;
  svgRef: RefObject<SVGSVGElement | null>;
}

export function Canvas({ diagram, svgRef }: CanvasProps) {
  const activeTool = useDiagramStore((state) => state.activeTool);
  const appearance = useDiagramStore((state) => state.appearance);

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
  const { isSpacePressed, spacePressedRef } = useCanvasKeyboard();

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
  const { alignmentGuides, updateAlignmentGuides, clearAlignmentGuides } =
    useCanvasAlignmentGuides(diagram);

  const {
    connectionPreview,
    connectionDropTargetId,
    startConnection,
    moveConnection,
    finishConnection,
    cancelConnection: cancelCanvasConnection,
  } = useCanvasConnection({
    diagram,
    getWorldPoint,
    beginConnection,
    cancelConnection,
    connectElements,
  });

  const { startDrag, drag, stopDrag } = useCanvasDrag({
    diagram,
    selectedElementIds,
    getSvgPoint: getWorldPoint,
    onDrag: updateAlignmentGuides,
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

  const { isToolDragOver, handleToolDragOver, handleToolDragLeave, handleToolDrop } =
    useCanvasToolDrop({
      getWorldPoint,
      createDiagramElementAt,
      startEditingElement,
      setActiveTool,
    });

  const selectedElement = selectedElementId
    ? findDiagramElement(diagram, selectedElementId)
    : undefined;

  const isConnectionSelected =
    selectedElementId !== null &&
    diagram.connections.some((connection) => connection.id === selectedElementId);

  function handlePointerDownCapture(event: PointerEvent<SVGSVGElement>) {
    const shouldPan = spacePressedRef.current || event.button === 1;

    if (!shouldPan) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    startPan(event);
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (isCreatableTool(activeTool) && event.button === 0) {
      const point = getWorldPoint(event.nativeEvent);

      if (!point) {
        return;
      }

      const element = createDiagramElementAt(activeTool, point);

      if (element.type !== 'isa') {
        startEditingElement(element);
      }
      setActiveTool('select');
      return;
    }

    if (activeTool === 'select' && event.button === 0 && startSelection(event)) {
      return;
    }

    startPan(event);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (moveConnection(event)) {
      return;
    }

    pan(event);
    drag(event);
    updateSelection(event);
  }

  function handlePointerUp(event: PointerEvent<SVGSVGElement>) {
    clearAlignmentGuides();

    if (finishConnection(event)) {
      return;
    }

    stopPan();
    stopDrag();
    finishSelection(event);
  }

  function handlePointerCancel() {
    clearAlignmentGuides();
    cancelCanvasConnection();
    stopPan();
    stopDrag();
    cancelSelection();
  }

  return (
    <main className="relative h-full min-h-0 w-full overflow-hidden">
      <div className="relative h-full min-h-0 w-full">
        <svg
          ref={svgRef}
          tabIndex={0}
          className={`${styles.canvas} block h-full w-full touch-none ${
            isToolDragOver
              ? 'cursor-copy'
              : isPanning
                ? 'cursor-grabbing'
                : isSpacePressed
                  ? 'cursor-grab'
                  : isCreatableTool(activeTool)
                    ? 'cursor-crosshair'
                    : activeTool === 'select'
                      ? 'cursor-default'
                      : 'cursor-grab'
          }`}
          viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
          onWheel={handleWheel}
          onPointerDownCapture={handlePointerDownCapture}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onDragOver={handleToolDragOver}
          onDragLeave={handleToolDragLeave}
          onDrop={handleToolDrop}
          role="application"
          aria-label="Lienzo del diagrama Entidad-Relación"
        >
          {isToolDragOver && (
            <rect
              x={2}
              y={2}
              width={canvasSize.width - 4}
              height={canvasSize.height - 4}
              fill="none"
              stroke="var(--color-brand-primary)"
              strokeWidth={2}
              strokeDasharray="8 6"
              pointerEvents="none"
            />
          )}

          <CanvasGrid camera={camera} canvasSize={canvasSize} />

          <g id="canvas-interaction-layer">
            {selectionBox && <SelectionBox box={selectionBox} />}

            <g
              id="diagram-world"
              transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}
            >
              <CanvasConnectionPreview preview={connectionPreview} />

              <CanvasAlignmentGuides guides={alignmentGuides} />

              <CanvasLayers
                diagram={diagram}
                elementColors={appearance.elementColors}
                editingElementId={editingElement?.id ?? null}
                selectedElementIds={selectedElementIds}
                connectionSourceId={connectionSourceId}
                connectionDropTargetId={connectionDropTargetId}
                activeTool={activeTool}
                onSelectElement={setSelectedElement}
                onToggleElement={toggleSelectedElement}
                onDeleteElement={removeElement}
                onElementPointerDown={startDrag}
                onConnectionHandlePointerDown={startConnection}
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
          </g>

          <ZoomControls
            canvasSize={canvasSize}
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
        </svg>

        <CanvasStatusBar
          diagram={diagram}
          selectedElement={selectedElement}
          selectedElementCount={selectedElementIds.length}
          isConnectionSelected={isConnectionSelected}
        />
      </div>
    </main>
  );
}
