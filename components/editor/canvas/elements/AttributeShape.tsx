import type { MouseEvent, PointerEvent } from 'react';

import { getElementAppearance } from '../../element-appearance';
import { ELEMENT_GEOMETRY } from './element-shape-geometry';

import type { Attribute } from '@/domain/diagram/models';

import { CONNECTION_HANDLE_OFFSET, ConnectionHandle } from './ConnectionHandle';
import { truncateElementLabel } from './element-label';
import { ElementInteractionGroup } from './ElementInteractionGroup';

const RX = ELEMENT_GEOMETRY.attribute.radiusX;
const RY = ELEMENT_GEOMETRY.attribute.radiusY;

interface AttributeShapeProps {
  attribute: Attribute;
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

function estimateTextWidth(text: string): number {
  const width = text.length * 5.6;

  return Math.min(Math.max(width, 24), RX * 2 - 14);
}

export function AttributeShape({
  attribute,
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
}: AttributeShapeProps) {
  const { x, y } = attribute.position;

  const fullDisplayName = attribute.composite ? `(${attribute.name})` : attribute.name;

  const displayName = truncateElementLabel(fullDisplayName, 16);
  const appearance = getElementAppearance(attribute.color);
  const halfTextWidth = estimateTextWidth(displayName) / 2;

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
      elementId={attribute.id}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...(onPointerDown ? { onPointerDown } : {})}
    >
      <g opacity={isInvalidTarget ? 0.35 : 1}>
        {attribute.multivalued && (
          <ellipse
            cx={x}
            cy={y}
            rx={RX + 5}
            ry={RY + 5}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            pointerEvents="none"
          />
        )}

        <ellipse
          cx={x}
          cy={y}
          rx={RX}
          ry={RY}
          fill={fill}
          fillOpacity={isConnectionDropTarget ? 0.12 : 1}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={attribute.derived ? '5 4' : undefined}
          className="transition-colors duration-150"
        />

        {!isEditing && (
          <>
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              className="pointer-events-none fill-text text-xs font-semibold"
            >
              <title>{fullDisplayName}</title>
              {displayName}
              {attribute.optional && <tspan className="fill-text-muted font-normal"> (O)</tspan>}
            </text>

            {attribute.keyType === 'primary' && (
              <line
                x1={x - halfTextWidth}
                y1={y + 8}
                x2={x + halfTextWidth}
                y2={y + 8}
                className="pointer-events-none stroke-text"
                strokeWidth={2}
              />
            )}

            {attribute.keyType === 'partial' && (
              <line
                x1={x - halfTextWidth}
                y1={y + 8}
                x2={x + halfTextWidth}
                y2={y + 8}
                className="pointer-events-none stroke-text"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            )}

            {attribute.unique && (
              <line
                x1={x - halfTextWidth}
                y1={y + 12}
                x2={x + halfTextWidth}
                y2={y + 12}
                className="pointer-events-none stroke-text-muted"
                strokeWidth={0.75}
              />
            )}
          </>
        )}
      </g>

      {selected && showConnectionHandle && (
        <g data-export-exclude>
          <ConnectionHandle
            x={x + RX + CONNECTION_HANDLE_OFFSET}
            y={y}
            onPointerDown={onConnectionPointerDown}
          />
        </g>
      )}
    </ElementInteractionGroup>
  );
}
