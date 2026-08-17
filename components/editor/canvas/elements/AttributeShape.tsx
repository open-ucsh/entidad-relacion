import type { MouseEvent, PointerEvent } from 'react';

import type { Attribute } from '@/domain/diagram/models';

import { ConnectionHandle } from './ConnectionHandle';
import { ElementInteractionGroup } from './ElementInteractionGroup';

const RX = 55;
const RY = 28;

interface AttributeShapeProps {
  attribute: Attribute;
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

function estimateTextWidth(text: string): number {
  const width = text.length * 5.6;

  return Math.min(Math.max(width, 24), RX * 2 - 14);
}

export function AttributeShape({
  attribute,
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
}: AttributeShapeProps) {
  const { x, y } = attribute.position;

  const displayName = attribute.composite ? `(${attribute.name})` : attribute.name;
  const halfTextWidth = estimateTextWidth(displayName) / 2;

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
      elementId={attribute.id}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...(onPointerDown ? { onPointerDown } : {})}
    >
      <g opacity={elementOpacity}>
        {attribute.multivalued && (
          <ellipse
            cx={x}
            cy={y}
            rx={RX + 5}
            ry={RY + 5}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
          />
        )}

        <ellipse
          cx={x}
          cy={y}
          rx={RX}
          ry={RY}
          fill={fill}
          fillOpacity={fillOpacity}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeOpacity={strokeOpacity}
          strokeDasharray={attribute.derived ? '5 4' : undefined}
        />

        <text x={x} y={y + 4} textAnchor="middle" className="fill-text text-xs font-semibold">
          {displayName}
          {attribute.optional && <tspan className="fill-text-muted font-normal"> (O)</tspan>}
        </text>

        {attribute.keyType === 'primary' && (
          <line
            x1={x - halfTextWidth}
            y1={y + 8}
            x2={x + halfTextWidth}
            y2={y + 8}
            className="stroke-text"
            strokeWidth={2}
          />
        )}

        {attribute.keyType === 'partial' && (
          <line
            x1={x - halfTextWidth}
            y1={y + 8}
            x2={x + halfTextWidth}
            y2={y + 8}
            className="stroke-text"
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
            className="stroke-text-muted"
            strokeWidth={0.75}
          />
        )}
      </g>

      {selected && (
        <g data-export-exclude pointerEvents="none">
          {attribute.multivalued && (
            <ellipse
              cx={x}
              cy={y}
              rx={RX + 5}
              ry={RY + 5}
              fill="none"
              stroke="var(--color-brand-primary)"
              strokeWidth={3}
            />
          )}

          <ellipse
            cx={x}
            cy={y}
            rx={RX}
            ry={RY}
            fill="none"
            stroke="var(--color-brand-primary)"
            strokeWidth={3}
            strokeDasharray={attribute.derived ? '5 4' : undefined}
          />
        </g>
      )}

      {selected && showConnectionHandle && (
        <g data-export-exclude>
          <circle cx={x + RX + 14} cy={y} r={9} fill="var(--color-brand-primary)" />

          <ConnectionHandle x={x + RX + 14} y={y} onPointerDown={onConnectionPointerDown} />
        </g>
      )}
    </ElementInteractionGroup>
  );
}
