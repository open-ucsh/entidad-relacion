'use client';

import { CardinalityMark } from './CardinalityMark';
import { createConnectionPath } from './lib/connection-geometry';
import type { RelationLine } from './lib/relation-lines';

interface LogicalRelationPathProps {
  line: RelationLine;
  selected: boolean;
  hovered: boolean;
  dimmed: boolean;
  onHoverChange: (hovered: boolean) => void;
  onSelect: () => void;
}

export function LogicalRelationPath({
  line,
  selected,
  hovered,
  dimmed,
  onHoverChange,
  onSelect,
}: LogicalRelationPathProps) {
  const path = createConnectionPath(line.start, line.end, line.startSide, line.endSide);

  const emphasized = selected || hovered;

  const opacity = dimmed ? 0.22 : emphasized ? 1 : 0.72;

  const strokeWidth = selected ? 2.5 : hovered ? 2 : 1.5;

  return (
    <g opacity={opacity} className="transition-opacity duration-150">
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        pointerEvents="stroke"
        className="cursor-pointer"
        onPointerEnter={() => {
          onHoverChange(true);
        }}
        onPointerLeave={() => {
          onHoverChange(false);
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      />

      {emphasized && (
        <path
          d={path}
          fill="none"
          stroke="var(--color-brand-primary)"
          strokeWidth={selected ? 7 : 5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={selected ? 0.12 : 0.08}
          className="pointer-events-none"
        />
      )}

      <path
        d={path}
        fill="none"
        stroke="var(--color-brand-primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none transition-[stroke-width] duration-150"
      />

      <g className="pointer-events-none">
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
    </g>
  );
}
