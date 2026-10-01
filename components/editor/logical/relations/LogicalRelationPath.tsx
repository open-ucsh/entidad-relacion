'use client';

import { CardinalityMark } from './CardinalityMark';
import { createConnectionPath } from './lib/connection-geometry';
import type { RelationLine } from './lib/relation-lines';

interface LogicalRelationPathProps {
  line: RelationLine;
  selected: boolean;
  onSelect: () => void;
}

export function LogicalRelationPath({ line, selected, onSelect }: LogicalRelationPathProps) {
  const path = createConnectionPath(line.start, line.end, line.startSide, line.endSide);

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        className="pointer-events-stroke cursor-pointer"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      />

      <path
        d={path}
        fill="none"
        stroke="var(--color-brand-primary)"
        strokeWidth={selected ? 2.5 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={selected ? 1 : 0.72}
        className="pointer-events-none transition-opacity"
      />

      <CardinalityMark
        point={line.start}
        side={line.startSide}
        cardinality={line.sourceCardinality}
      />

      <CardinalityMark
        point={line.end}
        side={line.endSide}
        cardinality={line.referencedCardinality}
      />
    </g>
  );
}
