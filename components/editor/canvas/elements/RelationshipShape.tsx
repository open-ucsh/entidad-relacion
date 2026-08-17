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
  showConnectionTargets: boolean;
  isConnectionTarget: boolean;
  isConnectionDropTarget: boolean;
  isConnectionTargetInvalid: boolean;
  onClick: (event: MouseEvent<SVGGElement>) => void;
  onDoubleClick: () => void;
  onPointerDown?: ((event: PointerEvent<SVGGElement>) => void) | undefined;
  onConnectionPointerDown: (event: PointerEvent<SVGGElement>) => void;
}

export function RelationshipShape({
  relationship,
  selected,
  showConnectionHandle,
  showConnectionTargets,
  isConnectionTarget,
  isConnectionDropTarget,
  isConnectionTargetInvalid,
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

  const identifyingPoints = [
    `${x},${y - HEIGHT / 2 - 5}`,
    `${x + WIDTH / 2 + 5},${y}`,
    `${x},${y + HEIGHT / 2 + 5}`,
    `${x - WIDTH / 2 - 5},${y}`,
  ].join(' ');

  const isInvalidTarget = showConnectionTargets && isConnectionTargetInvalid && !selected;
  const isValidTarget =
    showConnectionTargets && isConnectionTarget && !selected && !isConnectionDropTarget;
  const isActiveTarget = isConnectionDropTarget;

  const stroke = isActiveTarget
    ? 'var(--color-brand-primary-hover)'
    : isValidTarget
      ? 'var(--color-brand-primary)'
      : 'var(--color-border)';

  const strokeWidth = isActiveTarget ? 4 : isValidTarget ? 2 : 1.5;
  const strokeOpacity = isValidTarget ? 0.55 : 1;
  const elementOpacity = isInvalidTarget ? 0.35 : 1;

  const fill = isActiveTarget ? 'var(--color-brand-primary)' : 'var(--color-background)';
  const fillOpacity = isActiveTarget ? 0.12 : 1;

  return (
    <ElementInteractionGroup
      elementId={relationship.id}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...(onPointerDown ? { onPointerDown } : {})}
    >
      <g opacity={elementOpacity}>
        {relationship.kind === 'identifying' && (
          <polygon
            points={identifyingPoints}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
          />
        )}

        <polygon
          points={points}
          fill={fill}
          fillOpacity={fillOpacity}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeOpacity={strokeOpacity}
        />

        <text x={x} y={y + 4} textAnchor="middle" className="fill-text text-xs font-semibold">
          {relationship.name}
        </text>
      </g>

      {selected && (
        <g data-export-exclude pointerEvents="none">
          {relationship.kind === 'identifying' && (
            <polygon
              points={identifyingPoints}
              fill="none"
              stroke="var(--color-brand-primary)"
              strokeWidth={3}
            />
          )}

          <polygon
            points={points}
            fill="none"
            stroke="var(--color-brand-primary)"
            strokeWidth={3}
          />
        </g>
      )}

      {selected && showConnectionHandle && (
        <g data-export-exclude>
          <circle cx={x + WIDTH / 2 + 14} cy={y} r={9} fill="var(--color-brand-primary)" />

          <ConnectionHandle x={x + WIDTH / 2 + 14} y={y} onPointerDown={onConnectionPointerDown} />
        </g>
      )}
    </ElementInteractionGroup>
  );
}
