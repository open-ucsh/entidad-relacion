'use client';

import { type KeyboardEvent, type ReactNode } from 'react';
import { Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';

interface CanvasSize {
  width: number;
  height: number;
}

interface ZoomControlsProps {
  canvasSize: CanvasSize;
  zoomPercentage: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToView: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

interface IconButtonProps {
  x: number;
  y: number;
  size: number;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

const BUTTON = 32;
const PAD = 4;
const GAP = 2;
const PERCENT_W = 48;
const PILL_GAP = 8;
const MARGIN = 20;

function IconButton({ x, y, size, label, disabled = false, onClick, children }: IconButtonProps) {
  const activate = () => {
    if (!disabled) onClick();
  };

  return (
    <g
      data-export-exclude
      transform={`translate(${x} ${y})`}
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      onClick={(event) => {
        event.stopPropagation();
        activate();
      }}
      onKeyDown={(event: KeyboardEvent<SVGGElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          activate();
        }
      }}
    >
      <title>{label}</title>

      <rect
        width={size}
        height={size}
        rx={7}
        className={
          disabled
            ? 'fill-transparent'
            : 'fill-transparent transition-colors hover:fill-surface-hover'
        }
      />

      <g className={disabled ? 'opacity-35' : undefined}>{children}</g>
    </g>
  );
}

function Pill({ width, height }: { width: number; height: number }) {
  return (
    <rect
      width={width}
      height={height}
      rx={12}
      fill="var(--color-background)"
      stroke="var(--color-border)"
      strokeOpacity={0.7}
      className="drop-shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
    />
  );
}

export function ZoomControls({
  canvasSize,
  zoomPercentage,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToView,
  canZoomIn,
  canZoomOut,
}: ZoomControlsProps) {
  const height = BUTTON + PAD * 2;

  const zoomPillWidth = PAD * 2 + BUTTON * 2 + PERCENT_W + GAP * 2;
  const actionsPillWidth = PAD * 2 + BUTTON * 2 + GAP;

  const x = MARGIN;
  const y = canvasSize.height - height - MARGIN;

  const iconProps = { size: 15, color: 'var(--color-text-muted)', 'aria-hidden': true } as const;
  const iconOffset = (BUTTON - iconProps.size) / 2;

  return (
    <g
      data-export-exclude
      transform={`translate(${x} ${y})`}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <g>
        <Pill width={zoomPillWidth} height={height} />

        <IconButton
          x={PAD}
          y={PAD}
          size={BUTTON}
          label="Alejar"
          disabled={!canZoomOut}
          onClick={onZoomOut}
        >
          <Minus x={iconOffset} y={iconOffset} {...iconProps} />
        </IconButton>

        <text
          x={PAD + BUTTON + GAP + PERCENT_W / 2}
          y={height / 2 + 4}
          textAnchor="middle"
          className="fill-text text-xs font-medium tabular-nums"
        >
          {zoomPercentage}%
        </text>

        <IconButton
          x={PAD + BUTTON + GAP + PERCENT_W + GAP}
          y={PAD}
          size={BUTTON}
          label="Acercar"
          disabled={!canZoomIn}
          onClick={onZoomIn}
        >
          <Plus x={iconOffset} y={iconOffset} {...iconProps} />
        </IconButton>
      </g>

      <g transform={`translate(${zoomPillWidth + PILL_GAP} 0)`}>
        <Pill width={actionsPillWidth} height={height} />

        <IconButton
          x={PAD}
          y={PAD}
          size={BUTTON}
          label="Ajustar diagrama a la vista"
          onClick={onFitToView}
        >
          <Maximize2 x={iconOffset} y={iconOffset} {...iconProps} />
        </IconButton>

        <IconButton
          x={PAD + BUTTON + GAP}
          y={PAD}
          size={BUTTON}
          label="Restablecer vista"
          onClick={onReset}
        >
          <RotateCcw x={iconOffset} y={iconOffset} {...iconProps} />
        </IconButton>
      </g>
    </g>
  );
}
