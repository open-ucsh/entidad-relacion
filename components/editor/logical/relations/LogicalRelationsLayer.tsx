'use client';

import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

import type { LogicalTable, LogicalTablePosition } from '@/domain/logical/models';

import { calculateRelationLines, type RelationLine } from './lib/relation-lines';
import { LogicalRelationPath } from './LogicalRelationPath';

interface LogicalRelationsLayerProps {
  tables: LogicalTable[];
  positions: Record<string, LogicalTablePosition>;
  containerRef: RefObject<HTMLDivElement | null>;
  zoom: number;
}

export function LogicalRelationsLayer({
  tables,
  positions,
  containerRef,
  zoom,
}: LogicalRelationsLayerProps) {
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
  }, [containerRef, tables, positions, zoom]);

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

    const resizeObserver = new ResizeObserver(calculateLines);

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
        <LogicalRelationPath key={line.id} line={line} />
      ))}
    </svg>
  );
}
