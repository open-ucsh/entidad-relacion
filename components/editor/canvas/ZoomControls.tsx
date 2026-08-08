'use client';

import { Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  zoomPercentage: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToView: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

const BUTTON_CLASS_NAME =
  'flex h-9 w-9 items-center justify-center text-text-muted transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40';

export function ZoomControls({
  zoomPercentage,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToView,
  canZoomIn,
  canZoomOut,
}: ZoomControlsProps) {
  return (
    <div className="absolute bottom-5 left-5 z-20 flex overflow-hidden rounded-lg border border-border bg-background/90 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        aria-label="Alejar"
        title="Alejar"
        className={BUTTON_CLASS_NAME}
      >
        <Minus size={17} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onReset}
        aria-label={`Zoom actual ${zoomPercentage}%. Restablecer a 100%`}
        title="Restablecer zoom a 100%"
        className="h-9 min-w-14 border-x border-border px-2 text-xs font-semibold tabular-nums text-text transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
      >
        {zoomPercentage}%
      </button>

      <button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        aria-label="Acercar"
        title="Acercar"
        className={BUTTON_CLASS_NAME}
      >
        <Plus size={17} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onFitToView}
        aria-label="Ajustar diagrama a la vista"
        title="Ajustar diagrama a la vista"
        className={`${BUTTON_CLASS_NAME} border-l border-border`}
      >
        <Maximize2 size={16} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onReset}
        aria-label="Restablecer vista"
        title="Restablecer vista"
        className={`${BUTTON_CLASS_NAME} border-l border-border`}
      >
        <RotateCcw size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
