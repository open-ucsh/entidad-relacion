import type { RefObject } from 'react';

export function useSvgCoordinates(svgRef: RefObject<SVGSVGElement | null>) {
  function getSvgPoint(event: PointerEvent) {
    const svg = svgRef.current;

    if (!svg) {
      return null;
    }

    const matrix = svg.getScreenCTM();

    if (!matrix) {
      return null;
    }

    const point = svg.createSVGPoint();

    point.x = event.clientX;
    point.y = event.clientY;

    const svgPoint = point.matrixTransform(matrix.inverse());

    return {
      x: svgPoint.x,
      y: svgPoint.y,
    };
  }

  return {
    getSvgPoint,
  };
}
