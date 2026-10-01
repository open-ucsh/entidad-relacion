'use client';

import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

import type { LogicalTable } from '@/domain/logical/models';

import { CardinalityMark } from './relations/CardinalityMark';
import { createConnectionPath } from './relations/lib/connection-geometry';
import { calculateRelationLines, type RelationLine } from './relations/lib/relation-lines';

interface LogicalRelationsLayerProps {
  tables: LogicalTable[];
  containerRef: RefObject<HTMLDivElement | null>;
  zoom: number;
}

export function LogicalRelationsLayer({ tables, containerRef, zoom }: LogicalRelationsLayerProps) {
  const [lines, setLines] = useState<RelationLine[]>([]);

  const calculateLines = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    setLines(
      calculateRelationLines({
        container,
        tables,
        zoom,
      }),
    );
  }, [containerRef, tables, zoom]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(calculateLines);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [calculateLines]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      calculateLines();
    });

    resizeObserver.observe(container);

    const tableElements = container.querySelectorAll<HTMLElement>('[data-logical-table-id]');

    for (const table of tableElements) {
      resizeObserver.observe(table);
    }

    window.addEventListener('resize', calculateLines);

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener('resize', calculateLines);
    };
  }, [calculateLines, containerRef, tables]);

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      {lines.map((line) => (
        <g key={line.id}>
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
      ))}
    </svg>
  );
}
