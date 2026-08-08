'use client';

import type { Camera, CanvasSize } from './hooks/useCanvasViewport';

interface CanvasGridProps {
  camera: Camera;
  canvasSize: CanvasSize;
}

const GRID_SIZE = 24;

export function CanvasGrid({ camera, canvasSize }: CanvasGridProps) {
  return (
    <>
      <defs>
        <pattern
          id="canvas-grid"
          width={GRID_SIZE}
          height={GRID_SIZE}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}
        >
          <path
            d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
            fill="none"
            stroke="#e8eef5"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width={canvasSize.width} height={canvasSize.height} fill="url(#canvas-grid)" />
    </>
  );
}
