'use client';

import { useMemo, useRef } from 'react';

import type {
  LogicalDiagnostic,
  LogicalTable,
  LogicalTablePosition,
} from '@/domain/logical/models';

import type { LogicalSelection } from '../logical-selection';
import { LogicalRelationsLayer } from '../relations/LogicalRelationsLayer';
import { LogicalTableCard } from '../table/LogicalTableCard';
import { useLogicalCamera } from './hooks/useLogicalCamera';
import { useLogicalCanvasPan } from './hooks/useLogicalCanvasPan';
import { useLogicalCanvasSize } from './hooks/useLogicalCanvasSize';
import { getLogicalBounds, type PositionedLogicalTable } from './lib/logical-bounds';
import { LogicalCanvasEmptyState } from './LogicalCanvasEmptyState';
import { LogicalDiagnostics } from './LogicalDiagnostics';
import { LogicalZoomControls } from './LogicalZoomControls';

interface LogicalCanvasProps {
  tables: LogicalTable[];
  positions: Record<string, LogicalTablePosition>;
  diagnostics: LogicalDiagnostic[];
  canGenerateFromEr: boolean;
  selection: LogicalSelection;
  onSelectionChange: (selection: LogicalSelection) => void;
  onCreateTable: () => void;
  onGenerateFromEr: () => void;
}

const DEFAULT_POSITION: LogicalTablePosition = {
  x: 64,
  y: 64,
};

export function LogicalCanvas({
  tables,
  positions,
  diagnostics,
  canGenerateFromEr,
  selection,
  onSelectionChange,
  onCreateTable,
  onGenerateFromEr,
}: LogicalCanvasProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const positionedTables = useMemo<PositionedLogicalTable[]>(
    () =>
      tables.map((table) => ({
        table,
        position: positions[table.id] ?? DEFAULT_POSITION,
      })),
    [positions, tables],
  );

  const bounds = useMemo(() => getLogicalBounds(positionedTables), [positionedTables]);

  const viewportSize = useLogicalCanvasSize(viewportRef);

  const { camera, setCamera, fitToView, zoomIn, zoomOut, resetView, resetInitialFit, handleWheel } =
    useLogicalCamera({
      viewportRef,
      viewportSize,
      bounds,
      tableCount: tables.length,
    });

  const { isPanning, startPan, pan, stopPan } = useLogicalCanvasPan({
    setCamera,
  });

  function generateFromEr() {
    resetInitialFit();
    onSelectionChange(null);
    onGenerateFromEr();
  }

  return (
    <main
      ref={viewportRef}
      className={`relative h-full min-h-0 overflow-hidden bg-background ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onWheel={handleWheel}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onSelectionChange(null);
        }

        startPan(event);
      }}
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
        onPointerDown={() => {
          onSelectionChange(null);
        }}
      />

      {tables.length === 0 ? (
        <LogicalCanvasEmptyState
          canGenerateFromEr={canGenerateFromEr}
          onCreateTable={onCreateTable}
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
            tables={tables}
            containerRef={canvasRef}
            zoom={camera.zoom}
            selection={selection}
            onSelectRelation={(sourceTableId, foreignKeyId) => {
              onSelectionChange({
                type: 'relation',
                sourceTableId,
                foreignKeyId,
              });
            }}
          />

          {positionedTables.map(({ table, position }) => (
            <LogicalTableCard
              key={`${table.id}:${table.name}`}
              table={table}
              position={position}
              zoom={camera.zoom}
              selected={selection?.type === 'table' && selection.tableId === table.id}
              onSelect={() => {
                onSelectionChange({
                  type: 'table',
                  tableId: table.id,
                });
              }}
            />
          ))}
        </div>
      )}

      {tables.length > 0 && (
        <LogicalZoomControls
          zoom={camera.zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFit={fitToView}
          onReset={resetView}
        />
      )}

      <LogicalDiagnostics diagnostics={diagnostics} />
    </main>
  );
}
