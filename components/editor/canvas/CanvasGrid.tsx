'use client';

import { useId } from 'react';

import type { CanvasCamera, CanvasSize } from './hooks/useCanvasCamera';

interface CanvasGridProps {
  camera: CanvasCamera;
  canvasSize: CanvasSize;
}

const GRID_SIZE = 24;

export function CanvasGrid({ camera, canvasSize }: CanvasGridProps) {
  const gridId = useId();

  return (
    <>
      <defs>
        <pattern
          id={gridId}
          width={GRID_SIZE}
          height={GRID_SIZE}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}
        >
          <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r={1} fill="#cbd9e8" />
        </pattern>
      </defs>

      <rect
        data-canvas-grid
        width={canvasSize.width}
        height={canvasSize.height}
        fill={`url(#${gridId})`}
        pointerEvents="none"
      />
    </>
  );
}
