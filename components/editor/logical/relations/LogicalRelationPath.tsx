'use client';

import { CardinalityMark } from './CardinalityMark';
import { createConnectionPath } from './lib/connection-geometry';
import type { RelationLine } from './lib/relation-lines';

interface LogicalRelationPathProps {
  line: RelationLine;
}

export function LogicalRelationPath({ line }: LogicalRelationPathProps) {
  return (
    <g>
      <path
        d={createConnectionPath(line.start, line.end, line.startSide, line.endSide)}
        fill="none"
        stroke="var(--color-brand-primary)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
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
