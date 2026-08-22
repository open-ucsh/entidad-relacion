import type { MouseEvent, PointerEvent } from 'react';

import type { ElementColor } from '@/state/diagram/diagram-appearance';

import { getElementAppearance } from '../../element-appearance';
import { ELEMENT_GEOMETRY } from './element-shape-geometry';

import type { Entity } from '@/domain/diagram/models';

import { ConnectionHandle, CONNECTION_HANDLE_OFFSET } from './ConnectionHandle';
import { truncateElementLabel } from './element-label';
import { ElementInteractionGroup } from './ElementInteractionGroup';

const WIDTH = ELEMENT_GEOMETRY.entity.width;
const HEIGHT = ELEMENT_GEOMETRY.entity.height;

const DIAMOND_MARGIN_X = 14;
const DIAMOND_MARGIN_Y = 10;

interface EntityShapeProps {
  entity: Entity;

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

export function EntityShape({
  entity,
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
}: EntityShapeProps) {
  const displayName = truncateElementLabel(entity.name, 16);
  const appearance = getElementAppearance(color);

  const { x: centerX, y: centerY } = entity.position;
  const x = centerX - WIDTH / 2;
  const y = centerY - HEIGHT / 2;

  const isWeak = entity.kind === 'weak';
  const isAssociative = entity.kind === 'associative';

  const diamondWidth = WIDTH - DIAMOND_MARGIN_X * 2;
  const diamondHeight = HEIGHT - DIAMOND_MARGIN_Y * 2;

  const diamondPoints = [
    `${centerX},${centerY - diamondHeight / 2}`,
    `${centerX + diamondWidth / 2},${centerY}`,
    `${centerX},${centerY + diamondHeight / 2}`,
    `${centerX - diamondWidth / 2},${centerY}`,
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
      elementId={entity.id}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...(onPointerDown ? { onPointerDown } : {})}
    >
      <g opacity={isInvalidTarget ? 0.35 : 1}>
        {isWeak && (
          <rect
            x={x + 4}
            y={y + 4}
            width={WIDTH}
            height={HEIGHT}
            rx={5}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            pointerEvents="none"
          />
        )}

        <rect
          x={x}
          y={y}
          width={WIDTH}
          height={HEIGHT}
          rx={isAssociative ? 2 : 6}
          fill={fill}
          fillOpacity={isConnectionDropTarget ? 0.12 : 1}
          stroke={stroke}
          strokeWidth={strokeWidth}
          className="transition-colors duration-150"
        />

        {isAssociative && (
          <polygon
            points={diamondPoints}
            fill={fill}
            fillOpacity={isConnectionDropTarget ? 0.12 : 1}
            stroke={stroke}
            strokeWidth={selected ? 2 : 1.5}
            className="transition-colors duration-150"
            pointerEvents="none"
          />
        )}

        {!isEditing && (
          <text
            x={centerX}
            y={centerY + 4}
            textAnchor="middle"
            className="pointer-events-none fill-text text-xs font-semibold"
          >
            <title>{entity.name}</title>
            {displayName}
          </text>
        )}
      </g>

      {selected && showConnectionHandle && (
        <g data-export-exclude>
          <ConnectionHandle
            x={centerX + WIDTH / 2 + CONNECTION_HANDLE_OFFSET}
            y={centerY}
            onPointerDown={onConnectionPointerDown}
          />
        </g>
      )}
    </ElementInteractionGroup>
  );
}
