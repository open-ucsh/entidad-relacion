import type { MouseEvent, PointerEvent } from 'react';

import type { Relationship } from '@/domain/diagram/models';

import { ConnectionHandle } from './ConnectionHandle';
import { ElementInteractionGroup } from './ElementInteractionGroup';

const WIDTH = 120;
const HEIGHT = 60;

interface RelationshipShapeProps {
  relationship: Relationship;
  selected: boolean;
  showConnectionHandle: boolean;
  onClick: (event: MouseEvent<SVGGElement>) => void;
  onDoubleClick: () => void;
  onPointerDown?: ((event: PointerEvent<SVGGElement>) => void) | undefined;
  onConnectionPointerDown: (event: PointerEvent<SVGGElement>) => void;
}

export function RelationshipShape({
  relationship,
  selected,
  showConnectionHandle,
  onClick,
  onDoubleClick,
  onPointerDown,
  onConnectionPointerDown,
}: RelationshipShapeProps) {
  const { x, y } = relationship.position;

  const points = [
    `${x},${y - HEIGHT / 2}`,
    `${x + WIDTH / 2},${y}`,
    `${x},${y + HEIGHT / 2}`,
    `${x - WIDTH / 2},${y}`,
  ].join(' ');

  const stroke = selected ? 'var(--color-brand-primary)' : 'var(--color-border)';
  const strokeWidth = selected ? 3 : 1.5;

  return (
    <ElementInteractionGroup
      elementId={relationship.id}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...(onPointerDown ? { onPointerDown } : {})}
    >
      {relationship.kind === 'identifying' && (
        <polygon
          points={[
            `${x},${y - HEIGHT / 2 - 5}`,
            `${x + WIDTH / 2 + 5},${y}`,
            `${x},${y + HEIGHT / 2 + 5}`,
            `${x - WIDTH / 2 - 5},${y}`,
          ].join(' ')}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      )}

      <polygon
        points={points}
        className="fill-background"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      <text x={x} y={y + 4} textAnchor="middle" className="fill-text text-xs font-semibold">
        {relationship.name}
      </text>

      {selected && showConnectionHandle && (
        <ConnectionHandle x={x + WIDTH / 2 + 10} y={y} onPointerDown={onConnectionPointerDown} />
      )}
    </ElementInteractionGroup>
  );
}
