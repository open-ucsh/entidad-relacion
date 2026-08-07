import type { Attribute } from '@/domain/models';

const RX = 55;
const RY = 28;

interface AttributeShapeProps {
  attribute: Attribute;
  selected: boolean;
  onClick: () => void;
  onPointerDown?: (event: React.PointerEvent<SVGGElement>) => void;
}

export function AttributeShape({
  attribute,
  selected,
  onClick,
  onPointerDown,
}: AttributeShapeProps) {
  return (
    <g
      onPointerDown={onPointerDown}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={selected ? 'cursor-grabbing' : 'cursor-pointer'}
    >
      <ellipse
        cx={attribute.position.x}
        cy={attribute.position.y}
        rx={RX}
        ry={RY}
        className="fill-background stroke-border"
        stroke={selected ? 'var(--color-brand-primary: #004574;)' : undefined}
        strokeWidth={selected ? 3 : 1.5}
      />

      <text
        x={attribute.position.x}
        y={attribute.position.y + 4}
        textAnchor="middle"
        className="fill-text text-xs"
      >
        {attribute.name}
      </text>
    </g>
  );
}
