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

const BUTTON_CLASS =
  'flex size-10 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent';

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
      className="absolute left-4 top-4 z-30 flex items-center gap-2 lg:bottom-4 lg:top-auto"
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onWheel={(event) => {
        event.stopPropagation();
      }}
    >
      <div className="flex h-12 items-center gap-0.5 rounded-xl border border-border bg-background p-1 shadow-sm">
        <button
          type="button"
          aria-label="Alejar"
          title="Alejar"
          disabled={zoom <= MIN_LOGICAL_ZOOM}
          onClick={onZoomOut}
          className={BUTTON_CLASS}
        >
          <Minus size={17} aria-hidden="true" />
        </button>

        <span className="w-12 text-center text-xs font-medium tabular-nums text-text">
          {zoomPercentage}%
        </span>

        <button
          type="button"
          aria-label="Acercar"
          title="Acercar"
          disabled={zoom >= MAX_LOGICAL_ZOOM}
          onClick={onZoomIn}
          className={BUTTON_CLASS}
        >
          <Plus size={17} aria-hidden="true" />
        </button>
      </div>

      <div className="flex h-12 items-center gap-0.5 rounded-xl border border-border bg-background p-1 shadow-sm">
        <button
          type="button"
          aria-label="Ajustar modelo a la vista"
          title="Ajustar modelo a la vista"
          onClick={onFit}
          className={BUTTON_CLASS}
        >
          <Maximize2 size={17} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="Restablecer vista"
          title="Restablecer vista"
          onClick={onReset}
          className={BUTTON_CLASS}
        >
          <RotateCcw size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
