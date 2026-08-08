import type { Point } from '@/domain/diagram/models';

export function getSvgPoint(svg: SVGSVGElement, event: globalThis.PointerEvent): Point | null {
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
