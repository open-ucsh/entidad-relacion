import type { LogicalRelationCardinality } from '@/domain/logical/models';

import { getSideDirection, type Point, type Side } from './lib/connection-geometry';

interface CardinalityMarkProps {
  point: Point;
  side: Side;
  cardinality: LogicalRelationCardinality;
}

const MARK_GAP = 7;
const MARK_SIZE = 6;
const MARK_SPACING = 10;

export function CardinalityMark({ point, side, cardinality }: CardinalityMarkProps) {
  const direction = getSideDirection(side);

  const perpendicular = {
    x: -direction.y,
    y: direction.x,
  };

  const getPoint = (distance: number): Point => ({
    x: point.x + direction.x * distance,
    y: point.y + direction.y * distance,
  });

  const renderOne = (distance: number, key: string) => {
    const center = getPoint(distance);

    return (
      <line
        key={key}
        x1={center.x - perpendicular.x * MARK_SIZE}
        y1={center.y - perpendicular.y * MARK_SIZE}
        x2={center.x + perpendicular.x * MARK_SIZE}
        y2={center.y + perpendicular.y * MARK_SIZE}
        stroke="var(--color-brand-primary)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    );
  };

  const maximumMark =
    cardinality.maximum === 'N'
      ? (() => {
          const vertex = getPoint(MARK_GAP + MARK_SPACING);

          const upper = getPoint(MARK_GAP);
          const lower = getPoint(MARK_GAP);

          return (
            <g
              fill="none"
              stroke="var(--color-brand-primary)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line
                x1={vertex.x}
                y1={vertex.y}
                x2={upper.x + perpendicular.x * MARK_SIZE}
                y2={upper.y + perpendicular.y * MARK_SIZE}
              />

              <line x1={vertex.x} y1={vertex.y} x2={upper.x} y2={upper.y} />

              <line
                x1={vertex.x}
                y1={vertex.y}
                x2={lower.x - perpendicular.x * MARK_SIZE}
                y2={lower.y - perpendicular.y * MARK_SIZE}
              />
            </g>
          );
        })()
      : renderOne(MARK_GAP, 'maximum-one');

  const minimumDistance = MARK_GAP + MARK_SPACING;

  const minimumMark =
    cardinality.minimum === 0 ? (
      <circle
        cx={getPoint(minimumDistance).x}
        cy={getPoint(minimumDistance).y}
        r={3.25}
        fill="var(--color-background)"
        stroke="var(--color-brand-primary)"
        strokeWidth={1.5}
      />
    ) : (
      renderOne(minimumDistance, 'minimum-one')
    );

  return (
    <g>
      {maximumMark}
      {minimumMark}
    </g>
  );
}
