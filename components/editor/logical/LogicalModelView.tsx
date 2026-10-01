'use client';

import { useMemo, useRef } from 'react';

import type { Diagram } from '@/domain/diagram/models';
import type { LogicalTablePosition } from '@/domain/logical/models';
import { useDiagramStore } from '@/state/diagram/store';

import { LogicalCanvasEmptyState } from './canvas/LogicalCanvasEmptyState';
import { LogicalDiagnostics } from './canvas/LogicalDiagnostics';
import { useLogicalCamera } from './canvas/hooks/useLogicalCamera';
import { useLogicalCanvasPan } from './canvas/hooks/useLogicalCanvasPan';
import { useLogicalCanvasSize } from './canvas/hooks/useLogicalCanvasSize';
import { getLogicalBounds, type PositionedLogicalTable } from './canvas/lib/logical-bounds';
import { LogicalZoomControls } from './canvas/LogicalZoomControls';
import { LogicalRelationsLayer } from './relations/LogicalRelationsLayer';
import { LogicalTableCard } from './table/LogicalTableCard';

interface LogicalModelViewProps {
  diagram: Diagram;
}

const DEFAULT_POSITION: LogicalTablePosition = {
  x: 64,
  y: 64,
};

export function LogicalModelView({ diagram }: LogicalModelViewProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const workspace = useDiagramStore((state) => state.logicalWorkspace);

  const generateLogicalModel = useDiagramStore((state) => state.generateLogicalModel);

  const addLogicalTable = useDiagramStore((state) => state.addLogicalTable);

  const model = workspace.model;

  const positionedTables = useMemo<PositionedLogicalTable[]>(
    () =>
      model.tables.map((table) => ({
        table,
        position: workspace.positions[table.id] ?? DEFAULT_POSITION,
      })),
    [model.tables, workspace.positions],
  );

  const bounds = useMemo(() => getLogicalBounds(positionedTables), [positionedTables]);

  const viewportSize = useLogicalCanvasSize(viewportRef);

  const { camera, setCamera, fitToView, zoomIn, zoomOut, resetView, resetInitialFit, handleWheel } =
    useLogicalCamera({
      viewportRef,
      viewportSize,
      bounds,
      tableCount: model.tables.length,
    });

  const { isPanning, startPan, pan, stopPan } = useLogicalCanvasPan({
    setCamera,
  });

  const hasConceptualModel = diagram.entities.length > 0 || diagram.relationships.length > 0;

  function generateFromEr() {
    resetInitialFit();
    generateLogicalModel();
  }

  return (
    <main
      ref={viewportRef}
      className={`relative h-full min-h-0 overflow-hidden bg-surface ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onWheel={handleWheel}
      onPointerDown={startPan}
      onPointerMove={pan}
      onPointerUp={stopPan}
      onPointerCancel={stopPan}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
          backgroundPosition: `${camera.x}px ${camera.y}px`,
          backgroundSize: `${24 * camera.zoom}px ${24 * camera.zoom}px`,
        }}
        aria-hidden="true"
      />

      {model.tables.length === 0 ? (
        <LogicalCanvasEmptyState
          canGenerateFromEr={hasConceptualModel}
          onCreateTable={addLogicalTable}
          onGenerateFromEr={generateFromEr}
        />
      ) : (
        <div
          ref={canvasRef}
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: 1,
            height: 1,
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
          }}
        >
          <LogicalRelationsLayer
            tables={model.tables}
            containerRef={canvasRef}
            zoom={camera.zoom}
          />

          {positionedTables.map(({ table, position }) => (
            <LogicalTableCard
              key={`${table.id}:${table.name}`}
              table={table}
              position={position}
              zoom={camera.zoom}
            />
          ))}
        </div>
      )}

      {model.tables.length > 0 && (
        <LogicalZoomControls
          zoom={camera.zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFit={fitToView}
          onReset={resetView}
        />
      )}

      <LogicalDiagnostics diagnostics={model.diagnostics} />
    </main>
  );
}
