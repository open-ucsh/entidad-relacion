'use client';

import { type RefObject, useCallback, useLayoutEffect, useState } from 'react';

import type { LogicalTable, LogicalTablePosition } from '@/domain/logical/models';

import type { LogicalSelection } from '../logical-selection';
import { calculateRelationLines, type RelationLine } from './lib/relation-lines';
import { LogicalRelationPath } from './LogicalRelationPath';

interface LogicalRelationsLayerProps {
  tables: LogicalTable[];
  positions: Record<string, LogicalTablePosition>;
  containerRef: RefObject<HTMLDivElement | null>;
  zoom: number;
  selection: LogicalSelection;
  onSelectRelation: (sourceTableId: string, foreignKeyId: string) => void;
}

export function LogicalRelationsLayer({
  tables,
  positions,
  containerRef,
  zoom,
  selection,
  onSelectRelation,
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
      aria-label="Relaciones entre tablas"
    >
      {lines.map((line) => (
        <LogicalRelationPath
          key={line.id}
          line={line}
          selected={selection?.type === 'relation' && selection.foreignKeyId === line.id}
          onSelect={() => {
            onSelectRelation(line.sourceTableId, line.id);
          }}
        />
      ))}
    </svg>
  );
}
