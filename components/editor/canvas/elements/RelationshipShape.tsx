import type { MouseEvent, PointerEvent } from 'react';

import type { ElementColor } from '@/state/diagram/diagram-appearance';

import { getElementAppearance } from '../../element-appearance';
import { ELEMENT_GEOMETRY } from './element-shape-geometry';

import type { Relationship } from '@/domain/diagram/models';

import { ConnectionHandle, CONNECTION_HANDLE_OFFSET } from './ConnectionHandle';
import { truncateElementLabel } from './element-label';
import { ElementInteractionGroup } from './ElementInteractionGroup';

const WIDTH = ELEMENT_GEOMETRY.relationship.width;
const HEIGHT = ELEMENT_GEOMETRY.relationship.height;

interface RelationshipShapeProps {
  relationship: Relationship;

  color: ElementColor;
  selected: boolean;
  isEditing: boolean;
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
  color,
  selected,
  isEditing,
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
  const displayName = truncateElementLabel(relationship.name, 12);
  const appearance = getElementAppearance(color);

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

  const stroke = isConnectionDropTarget
    ? 'var(--color-brand-primary-hover)'
    : isValidTarget
      ? 'var(--color-brand-primary)'
      : appearance.stroke;

  const strokeWidth = isConnectionDropTarget ? 3 : selected ? 2.5 : isValidTarget ? 2 : 1.5;

  const fill = isConnectionDropTarget ? 'var(--color-brand-primary)' : appearance.fill;

  return (
    <ElementInteractionGroup
      elementId={relationship.id}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...(onPointerDown ? { onPointerDown } : {})}
    >
      <g opacity={isInvalidTarget ? 0.35 : 1}>
        {relationship.kind === 'identifying' && (
          <polygon
            points={identifyingPoints}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            pointerEvents="none"
          />
        )}

        <polygon
          points={points}
          fill={fill}
          fillOpacity={isConnectionDropTarget ? 0.12 : 1}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          className="transition-colors duration-150"
        />

        {!isEditing && (
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            className="pointer-events-none fill-text text-xs font-semibold"
          >
            <title>{relationship.name}</title>
            {displayName}
          </text>
        )}
      </g>

      {selected && showConnectionHandle && (
        <g data-export-exclude>
          <ConnectionHandle
            x={x + WIDTH / 2 + CONNECTION_HANDLE_OFFSET}
            y={y}
            onPointerDown={onConnectionPointerDown}
          />
        </g>
      )}
    </ElementInteractionGroup>
  );
}
