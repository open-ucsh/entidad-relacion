'use client';

import { useCallback, useMemo, useState } from 'react';

import type { Diagram, Point } from '@/domain/diagram/models';
import { getDiagramElements } from '@/domain/diagram/queries/elements';

import type { AlignmentGuides } from '../CanvasAlignmentGuides';

interface ElementPositionUpdate {
  id: string;
  position: Point;
}

const ALIGNMENT_THRESHOLD = 6;

function findAlignedCoordinate(
  movingPositions: number[],
  targetPositions: number[],
): number | null {
  let closestCoordinate: number | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const movingPosition of movingPositions) {
    for (const targetPosition of targetPositions) {
      const distance = Math.abs(movingPosition - targetPosition);

      if (distance <= ALIGNMENT_THRESHOLD && distance < closestDistance) {
        closestCoordinate = targetPosition;
        closestDistance = distance;
      }
    }
  }

  return closestCoordinate;
}

export function useCanvasAlignmentGuides(diagram: Diagram) {
  const [guides, setGuides] = useState<AlignmentGuides | null>(null);

  const elements = useMemo(() => getDiagramElements(diagram), [diagram]);

  const updateAlignmentGuides = useCallback(
    (updates: ElementPositionUpdate[]) => {
      const movingIds = new Set(updates.map((update) => update.id));

      const otherElements = elements.filter((element) => !movingIds.has(element.id));

      if (otherElements.length === 0) {
        setGuides(null);
        return;
      }

      const x = findAlignedCoordinate(
        updates.map((update) => update.position.x),
        otherElements.map((element) => element.position.x),
      );

      const y = findAlignedCoordinate(
        updates.map((update) => update.position.y),
        otherElements.map((element) => element.position.y),
      );

      setGuides(x === null && y === null ? null : { x, y });
    },
    [elements],
  );

  const clearAlignmentGuides = useCallback(() => {
    setGuides(null);
  }, []);

  return {
    alignmentGuides: guides,
    updateAlignmentGuides,
    clearAlignmentGuides,
  };
}
