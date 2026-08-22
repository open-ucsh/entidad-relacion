import type { DiagramElement } from '@/domain/diagram/models';

import type {
  ElementAlignment,
  ElementDistribution,
  ElementPositionUpdate,
} from '../diagram-store.types';

export function createAlignmentUpdates(
  elements: DiagramElement[],
  alignment: ElementAlignment,
): ElementPositionUpdate[] {
  if (elements.length < 2) {
    return [];
  }

  const xPositions = elements.map((element) => element.position.x);
  const yPositions = elements.map((element) => element.position.y);

  const left = Math.min(...xPositions);
  const right = Math.max(...xPositions);
  const top = Math.min(...yPositions);
  const bottom = Math.max(...yPositions);

  return elements.map((element) => ({
    id: element.id,
    position: {
      x:
        alignment === 'left'
          ? left
          : alignment === 'center'
            ? (left + right) / 2
            : alignment === 'right'
              ? right
              : element.position.x,
      y:
        alignment === 'top'
          ? top
          : alignment === 'middle'
            ? (top + bottom) / 2
            : alignment === 'bottom'
              ? bottom
              : element.position.y,
    },
  }));
}

export function createDistributionUpdates(
  elements: DiagramElement[],
  distribution: ElementDistribution,
): ElementPositionUpdate[] {
  if (elements.length < 3) {
    return [];
  }

  const axis = distribution === 'horizontal' ? 'x' : 'y';

  const sortedElements = [...elements].sort(
    (first, second) => first.position[axis] - second.position[axis],
  );

  const firstElement = sortedElements.at(0);
  const lastElement = sortedElements.at(-1);

  if (!firstElement || !lastElement) {
    return [];
  }

  const firstPosition = firstElement.position[axis];
  const lastPosition = lastElement.position[axis];
  const spacing = (lastPosition - firstPosition) / (sortedElements.length - 1);

  return sortedElements.map((element, index) => ({
    id: element.id,
    position: {
      ...element.position,
      [axis]: firstPosition + spacing * index,
    },
  }));
}
