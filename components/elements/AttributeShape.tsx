import type { Attribute } from '@/domain/models';

const RX = 55;
const RY = 28;

interface AttributeShapeProps {
  attribute: Attribute;
}

export function AttributeShape({ attribute }: AttributeShapeProps) {
  return (
    <g>
      <ellipse
        cx={attribute.position.x}
        cy={attribute.position.y}
        rx={RX}
        ry={RY}
        className="fill-background stroke-border"
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
