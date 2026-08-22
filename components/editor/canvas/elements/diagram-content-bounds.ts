import type { Diagram } from '@/domain/diagram/models';

import { getDiagramElements } from '@/domain/diagram/queries/elements';

import { getElementVisualBounds } from './element-shape-geometry';

export interface DiagramBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getDiagramContentBounds(diagram: Diagram): DiagramBounds | null {
  const elements = getDiagramElements(diagram).map(getElementVisualBounds);

  if (elements.length === 0) {
    return null;
  }

  const left = Math.min(...elements.map((element) => element.center.x - element.halfWidth));
  const right = Math.max(...elements.map((element) => element.center.x + element.halfWidth));
  const top = Math.min(...elements.map((element) => element.center.y - element.halfHeight));
  const bottom = Math.max(...elements.map((element) => element.center.y + element.halfHeight));

  return {
    x: left,
    y: top,
    width: Math.max(right - left, 1),
    height: Math.max(bottom - top, 1),
  };
}
