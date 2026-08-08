import type { Attribute } from '@/domain/models';

const RX = 55;
const RY = 28;

interface AttributeShapeProps {
  attribute: Attribute;
  selected: boolean;
  onClick: () => void;
  onPointerDown?: (event: React.PointerEvent) => void;
}

function estimateTextWidth(text: string): number {
  const width = text.length * 5.6;
  return Math.min(Math.max(width, 24), RX * 2 - 14);
}

export function AttributeShape({
  attribute,
  selected,
  onClick,
  onPointerDown,
}: AttributeShapeProps) {
  const { x, y } = attribute.position;

  const isPrimary = attribute.keyType === 'primary';
  const isPartial = attribute.keyType === 'partial';

  const displayName = attribute.composite ? `(${attribute.name})` : attribute.name;

  const textWidth = estimateTextWidth(displayName);
  const halfWidth = textWidth / 2;

  return (
    <g
      onPointerDown={onPointerDown}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={selected ? 'cursor-grabbing' : 'cursor-pointer'}
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

      {/* Clave primaria: subrayado sólido grueso */}
      {isPrimary && (
        <line
          x1={x - halfWidth}
          y1={y + 8}
          x2={x + halfWidth}
          y2={y + 8}
          className="stroke-text"
          strokeWidth={2}
        />
      )}

      {/* Clave parcial: subrayado punteado grueso */}
      {isPartial && (
        <line
          x1={x - halfWidth}
          y1={y + 8}
          x2={x + halfWidth}
          y2={y + 8}
          className="stroke-text"
          strokeWidth={2}
          strokeDasharray="4 3"
        />
      )}

      {attribute.unique && (
        <line
          x1={x - halfWidth}
          y1={y + 12}
          x2={x + halfWidth}
          y2={y + 12}
          className="stroke-text-muted"
          strokeWidth={0.75}
        />
      )}
    </g>
  );
}
