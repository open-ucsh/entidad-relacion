'use client';

import { useCallback, type RefObject } from 'react';

import { getSvgPoint } from '../lib/coordinates';

import type { CanvasCamera } from './useCanvasCamera';

export function useWorldCoordinates(svgRef: RefObject<SVGSVGElement | null>, camera: CanvasCamera) {
  const getWorldPoint = useCallback(
    (event: globalThis.PointerEvent) => {
      const svg = svgRef.current;

      if (!svg) {
        return null;
      }

      const point = getSvgPoint(svg, event);

      if (!point) {
        return null;
      }

      return {
        x: (point.x - camera.x) / camera.zoom,
        y: (point.y - camera.y) / camera.zoom,
      };
    },
    [camera, svgRef],
  );

  return {
    getWorldPoint,
  };
}
