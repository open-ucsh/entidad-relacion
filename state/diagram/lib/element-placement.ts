import { distance } from '@/domain/diagram/lib/point';
import type { Diagram, Point } from '@/domain/diagram/models';

import { findDiagramElement, getDiagramElements } from '@/domain/diagram/queries/elements';

const ATTRIBUTE_DISTANCE = 120;
const MIN_ATTRIBUTE_DISTANCE = 85;

const ATTRIBUTE_DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0.7, y: 0.7 },
  { x: 0, y: 1 },
  { x: -0.7, y: 0.7 },
  { x: -1, y: 0 },
  { x: -0.7, y: -0.7 },
  { x: 0, y: -1 },
  { x: 0.7, y: -0.7 },
] as const;

export function findConnectedAttributePosition(diagram: Diagram, parentId: string): Point | null {
  const parent = findDiagramElement(diagram, parentId);

  if (!parent) {
    return null;
  }

  const occupiedPositions = getDiagramElements(diagram).map((element) => element.position);

  for (let ring = 1; ring <= 4; ring += 1) {
    const distanceFromParent = ATTRIBUTE_DISTANCE * ring;

    for (const direction of ATTRIBUTE_DIRECTIONS) {
      const position = {
        x: parent.position.x + direction.x * distanceFromParent,
        y: parent.position.y + direction.y * distanceFromParent,
      };

      const isFree = occupiedPositions.every(
        (occupiedPosition) => distance(occupiedPosition, position) > MIN_ATTRIBUTE_DISTANCE,
      );

      if (isFree) {
        return position;
      }
    }
  }

  return {
    x: parent.position.x + ATTRIBUTE_DISTANCE,
    y: parent.position.y,
  };
}
