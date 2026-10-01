'use client';

import { Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';

import { MAX_LOGICAL_ZOOM, MIN_LOGICAL_ZOOM } from './lib/logical-camera';

interface LogicalZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
}

export function LogicalZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
}: LogicalZoomControlsProps) {
  const zoomPercentage = Math.round(zoom * 100);

  return (
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
          disabled={zoom <= MIN_LOGICAL_ZOOM}
          onClick={onZoomOut}
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
          disabled={zoom >= MAX_LOGICAL_ZOOM}
          onClick={onZoomIn}
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
          onClick={onFit}
          className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover"
        >
          <Maximize2 size={15} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="Restablecer vista"
          title="Restablecer vista"
          onClick={onReset}
          className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover"
        >
          <RotateCcw size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
