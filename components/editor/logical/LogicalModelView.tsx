'use client';

import {
  AlertTriangle,
  Database,
  Info,
  Maximize2,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';

import type { Diagram } from '@/domain/diagram/models';
import type { LogicalTablePosition } from '@/domain/logical/models';
import { useDiagramStore } from '@/state/diagram/store';

import { LogicalRelationsLayer } from './LogicalRelationsLayer';
import { LogicalTableCard } from './LogicalTableCard';

interface LogicalModelViewProps {
  diagram: Diagram;
}

interface Camera {
  x: number;
  y: number;
  zoom: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_POSITION: LogicalTablePosition = {
  x: 64,
  y: 64,
};

const INITIAL_CAMERA: Camera = {
  x: 0,
  y: 0,
  zoom: 1,
};

const TABLE_WIDTH = 288;
const TABLE_ESTIMATED_HEIGHT = 360;

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 1.1;
const FIT_PADDING = 72;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getLogicalBounds(
  positions: Array<{
    position: LogicalTablePosition;
  }>,
): Bounds | null {
  if (positions.length === 0) {
    return null;
  }

  const minX = Math.min(...positions.map(({ position }) => position.x));

  const minY = Math.min(...positions.map(({ position }) => position.y));

  const maxX = Math.max(...positions.map(({ position }) => position.x + TABLE_WIDTH));

  const maxY = Math.max(...positions.map(({ position }) => position.y + TABLE_ESTIMATED_HEIGHT));

  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

export function LogicalModelView({ diagram }: LogicalModelViewProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const panStartRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const didInitialFitRef = useRef(false);

  const workspace = useDiagramStore((state) => state.logicalWorkspace);

  const generateLogicalModel = useDiagramStore((state) => state.generateLogicalModel);

  const addLogicalTable = useDiagramStore((state) => state.addLogicalTable);

  const model = workspace.model;

  const [viewportSize, setViewportSize] = useState<ViewportSize>({
    width: 1,
    height: 1,
  });

  const [camera, setCamera] = useState<Camera>(INITIAL_CAMERA);

  const [isPanning, setIsPanning] = useState(false);

  const positionedTables = useMemo(
    () =>
      model.tables.map((table) => ({
        table,
        position: workspace.positions[table.id] ?? DEFAULT_POSITION,
      })),
    [model.tables, workspace.positions],
  );

  const bounds = useMemo(() => getLogicalBounds(positionedTables), [positionedTables]);

  const errorCount = model.diagnostics.filter(
    (diagnostic) => diagnostic.severity === 'error',
  ).length;

  const warningCount = model.diagnostics.length - errorCount;

  const hasConceptualModel = diagram.entities.length > 0 || diagram.relationships.length > 0;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    function updateViewportSize() {
      const currentViewport = viewportRef.current;

      if (!currentViewport) {
        return;
      }

      const rect = currentViewport.getBoundingClientRect();

      setViewportSize({
        width: Math.max(rect.width, 1),
        height: Math.max(rect.height, 1),
      });
    }

    updateViewportSize();

    const observer = new ResizeObserver(updateViewportSize);

    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, []);

  const fitToView = useCallback(() => {
    if (!bounds) {
      setCamera(INITIAL_CAMERA);
      return;
    }

    const availableWidth = Math.max(viewportSize.width - FIT_PADDING * 2, 1);

    const availableHeight = Math.max(viewportSize.height - FIT_PADDING * 2, 1);

    const zoom = clamp(
      Math.min(availableWidth / bounds.width, availableHeight / bounds.height),
      MIN_ZOOM,
      MAX_ZOOM,
    );

    const centerX = bounds.x + bounds.width / 2;

    const centerY = bounds.y + bounds.height / 2;

    setCamera({
      zoom,
      x: viewportSize.width / 2 - centerX * zoom,
      y: viewportSize.height / 2 - centerY * zoom,
    });
  }, [bounds, viewportSize.height, viewportSize.width]);

  useLayoutEffect(() => {
    if (model.tables.length === 0) {
      didInitialFitRef.current = false;

      const frame = requestAnimationFrame(() => {
        setCamera(INITIAL_CAMERA);
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    if (viewportSize.width <= 1 || viewportSize.height <= 1 || didInitialFitRef.current) {
      return;
    }

    didInitialFitRef.current = true;

    const frame = requestAnimationFrame(() => {
      fitToView();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [fitToView, model.tables.length, viewportSize.height, viewportSize.width]);

  const zoomAtPoint = useCallback(
    (
      factor: number,
      point: {
        x: number;
        y: number;
      },
    ) => {
      setCamera((current) => {
        const zoom = clamp(current.zoom * factor, MIN_ZOOM, MAX_ZOOM);

        if (zoom === current.zoom) {
          return current;
        }

        return {
          x: point.x - ((point.x - current.x) / current.zoom) * zoom,
          y: point.y - ((point.y - current.y) / current.zoom) * zoom,
          zoom,
        };
      });
    },
    [],
  );

  const zoomIn = useCallback(() => {
    zoomAtPoint(ZOOM_STEP, {
      x: viewportSize.width / 2,
      y: viewportSize.height / 2,
    });
  }, [viewportSize.height, viewportSize.width, zoomAtPoint]);

  const zoomOut = useCallback(() => {
    zoomAtPoint(1 / ZOOM_STEP, {
      x: viewportSize.width / 2,
      y: viewportSize.height / 2,
    });
  }, [viewportSize.height, viewportSize.width, zoomAtPoint]);

  const resetView = useCallback(() => {
    setCamera(INITIAL_CAMERA);
  }, []);

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();

    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();

    zoomAtPoint(event.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP, {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    if (
      target.closest('[data-logical-table-id], button, input, select, textarea, [role="button"]')
    ) {
      return;
    }

    const isTouch = event.pointerType === 'touch';

    const isMousePan = event.button === 0 || event.button === 1;

    if (!isTouch && !isMousePan) {
      return;
    }

    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    setIsPanning(true);

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pan(event: ReactPointerEvent<HTMLDivElement>) {
    const start = panStartRef.current;

    if (!start) {
      return;
    }

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    setCamera((current) => ({
      ...current,
      x: current.x + dx,
      y: current.y + dy,
    }));

    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function stopPan() {
    panStartRef.current = null;
    setIsPanning(false);
  }

  const zoomPercentage = Math.round(camera.zoom * 100);

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
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="flex max-w-md flex-col items-center text-center">
            <span className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
              <Database size={23} className="text-brand-primary" aria-hidden="true" />
            </span>

            <h2 className="text-base font-semibold text-text">Construye tu modelo lógico</h2>

            <p className="mt-2 text-sm leading-6 text-text-muted">
              Crea las tablas manualmente o transforma tu modelo entidad-relación.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  addLogicalTable();
                }}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-text shadow-sm transition-colors hover:bg-surface-hover"
              >
                <Plus size={15} aria-hidden="true" />
                Crear tabla
              </button>

              <button
                type="button"
                disabled={!hasConceptualModel}
                onClick={() => {
                  didInitialFitRef.current = false;
                  generateLogicalModel();
                }}
                className="flex items-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCw size={15} aria-hidden="true" />
                Generar desde ER
              </button>
            </div>
          </div>
        </div>
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
            <LogicalTableCard key={table.id} table={table} position={position} zoom={camera.zoom} />
          ))}
        </div>
      )}

      {model.tables.length > 0 && (
        <div
          className="absolute bottom-5 left-5 z-40 flex items-center gap-2"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="flex h-10 items-center rounded-xl border border-border bg-background shadow-sm">
            <button
              type="button"
              aria-label="Alejar"
              disabled={camera.zoom <= MIN_ZOOM}
              onClick={zoomOut}
              className="flex size-10 items-center justify-center rounded-l-xl text-text-muted transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Minus size={15} aria-hidden="true" />
            </button>

            <span className="w-12 text-center text-xs font-medium tabular-nums text-text">
              {zoomPercentage}%
            </span>

            <button
              type="button"
              aria-label="Acercar"
              disabled={camera.zoom >= MAX_ZOOM}
              onClick={zoomIn}
              className="flex size-10 items-center justify-center rounded-r-xl text-text-muted transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Plus size={15} aria-hidden="true" />
            </button>
          </div>

          <div className="flex h-10 items-center rounded-xl border border-border bg-background p-1 shadow-sm">
            <button
              type="button"
              aria-label="Ajustar modelo a la vista"
              title="Ajustar modelo a la vista"
              onClick={fitToView}
              className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover"
            >
              <Maximize2 size={15} aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label="Restablecer vista"
              title="Restablecer vista"
              onClick={resetView}
              className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover"
            >
              <RotateCcw size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {model.diagnostics.length > 0 && (
        <section className="absolute bottom-5 right-5 z-40 max-h-72 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-background/95 shadow-lg backdrop-blur">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-xs font-semibold text-text">Diagnóstico</h2>

              <p className="mt-0.5 text-[10px] text-text-muted">Transformación ER → lógico</p>
            </div>

            <div className="flex items-center gap-1.5">
              {errorCount > 0 && (
                <span className="flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-600">
                  <AlertTriangle size={11} aria-hidden="true" />
                  {errorCount}
                </span>
              )}

              {warningCount > 0 && (
                <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-600">
                  <Info size={11} aria-hidden="true" />
                  {warningCount}
                </span>
              )}
            </div>
          </header>

          <div className="max-h-56 divide-y divide-border overflow-y-auto">
            {model.diagnostics.map((diagnostic) => {
              const Icon = diagnostic.severity === 'error' ? AlertTriangle : Info;

              return (
                <div key={diagnostic.id} className="flex items-start gap-3 px-4 py-3">
                  <Icon
                    size={14}
                    className={
                      diagnostic.severity === 'error'
                        ? 'mt-0.5 shrink-0 text-red-600'
                        : 'mt-0.5 shrink-0 text-amber-600'
                    }
                    aria-hidden="true"
                  />

                  <p className="text-xs leading-5 text-text-muted">{diagnostic.message}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
