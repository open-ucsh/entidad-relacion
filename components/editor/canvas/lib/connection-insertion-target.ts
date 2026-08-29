import type { Diagram, Point } from '@/domain/diagram/models';
import { canInsertRelationshipIntoConnection } from '@/domain/diagram/validation/connections';

import { getConnectionEndpoints } from './connection-endpoints';

const MAX_INSERTION_DISTANCE = 32;

export interface ConnectionInsertionTarget {
  connectionId: string;
  position: Point;
  distance: number;
}

function getClosestPointOnSegment(point: Point, start: Point, end: Point): Point {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return start;
  }

  const projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;

  const position = Math.max(0, Math.min(1, projection));

  return {
    x: start.x + dx * position,
    y: start.y + dy * position,
  };
}

function getDistance(first: Point, second: Point): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function findConnectionInsertionTarget(
  diagram: Diagram,
  relationshipId: string | null,
  position: Point,
): ConnectionInsertionTarget | null {
  let closestTarget: ConnectionInsertionTarget | null = null;

  for (const connection of diagram.connections) {
    if (!canInsertRelationshipIntoConnection(diagram, relationshipId, connection.id)) {
      continue;
    }

    const endpoints = getConnectionEndpoints(diagram, connection);

    if (!endpoints) {
      continue;
    }

    const closestPoint = getClosestPointOnSegment(position, endpoints.from, endpoints.to);

    const distance = getDistance(position, closestPoint);

    if (
      distance > MAX_INSERTION_DISTANCE ||
      (closestTarget && distance >= closestTarget.distance)
    ) {
      continue;
    }

    closestTarget = {
      connectionId: connection.id,
      position: closestPoint,
      distance,
    };
  }

  return closestTarget;
}
