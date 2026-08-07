import type { Relationship } from '@/domain/models';

interface RelationshipShapeProps {
  relationship: Relationship;
}

export function RelationshipShape({ relationship }: RelationshipShapeProps) {
  const { x, y } = relationship.position;

  return (
    <g>
      <text x={x} y={y + 4} textAnchor="middle" className="fill-text text-xs font-semibold">
        {relationship.name}
      </text>
    </g>
  );
}
