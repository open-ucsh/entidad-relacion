import type { MouseEvent, PointerEvent } from 'react';

import type { Attribute } from '@/domain/diagram/models';

import { ElementInteractionGroup } from './ElementInteractionGroup';

const RX = 55;
const RY = 28;

interface AttributeShapeProps {
  attribute: Attribute;
  selected: boolean;
  onClick: (event: MouseEvent<SVGGElement>) => void;
  onDoubleClick: () => void;
  onPointerDown?: (event: PointerEvent<SVGGElement>) => void;
}

function estimateTextWidth(text: string): number {
  const width = text.length * 5.6;

  return Math.min(Math.max(width, 24), RX * 2 - 14);
}

export function AttributeShape({
  attribute,
  selected,
  onClick,
  onDoubleClick,
  onPointerDown,
}: AttributeShapeProps) {
  const { x, y } = attribute.position;

  const displayName = attribute.composite ? `(${attribute.name})` : attribute.name;

  const halfTextWidth = estimateTextWidth(displayName) / 2;

  return (
    <ElementInteractionGroup
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
    >
      {attribute.multivalued && (
        <ellipse
          cx={x}
          cy={y}
          rx={RX + 5}
          ry={RY + 5}
          fill="none"
          className="stroke-border"
          strokeWidth={selected ? 3 : 1.5}
        />
      )}

      <ellipse
        cx={x}
        cy={y}
        rx={RX}
        ry={RY}
        className="fill-background stroke-border"
        stroke={selected ? 'var(--color-brand-primary)' : undefined}
        strokeWidth={selected ? 3 : 1.5}
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
    </ElementInteractionGroup>
  );
}
