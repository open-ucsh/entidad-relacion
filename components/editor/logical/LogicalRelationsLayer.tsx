'use client';

import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

import type { LogicalTable } from '@/domain/logical/models';

interface LogicalRelationsLayerProps {
  tables: LogicalTable[];
  containerRef: RefObject<HTMLDivElement | null>;
}

interface Point {
  x: number;
  y: number;
}

interface RelationLine {
  id: string;
  start: Point;
  end: Point;
  startDirection: 1 | -1;
  endDirection: 1 | -1;
  sourceOptional: boolean;
}

interface TableElements {
  table: HTMLElement;
  column: HTMLElement | null;
}

const MARK_GAP = 7;
const MARK_SIZE = 8;
const CONNECTION_OFFSET = 30;

function escapeSelector(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return value.replace(/["\\]/g, (character) => `\\${character}`);
}

function findTableElements(
  container: HTMLElement,
  tableId: string,
  columnId: string | undefined,
): TableElements | null {
  const table = container.querySelector<HTMLElement>(
    `[data-logical-table-id="${escapeSelector(tableId)}"]`,
  );

  if (!table) {
    return null;
  }

  if (!columnId) {
    return {
      table,
      column: null,
    };
  }

  const column = table.querySelector<HTMLElement>(
    `[data-logical-column-id="${escapeSelector(columnId)}"]`,
  );

  return {
    table,
    column,
  };
}

function getCenterY(
  table: HTMLElement,
  column: HTMLElement | null,
  containerRect: DOMRect,
): number {
  const rect = (column ?? table).getBoundingClientRect();

  return rect.top - containerRect.top + rect.height / 2;
}

function createPath(
  start: Point,
  end: Point,
  startDirection: 1 | -1,
  endDirection: 1 | -1,
): string {
  const startOuterX = start.x + startDirection * CONNECTION_OFFSET;

  const endOuterX = end.x + endDirection * CONNECTION_OFFSET;

  /*
   * Cuando ambas tablas permiten un corredor entre ellas,
   * usamos el punto medio.
   *
   * Cuando no, igualmente sacamos primero la línea fuera
   * de cada tarjeta antes de cambiar de dirección.
   */
  const middleX = (startOuterX + endOuterX) / 2;

  return [
    `M ${start.x} ${start.y}`,
    `L ${startOuterX} ${start.y}`,
    `L ${middleX} ${start.y}`,
    `L ${middleX} ${end.y}`,
    `L ${endOuterX} ${end.y}`,
    `L ${end.x} ${end.y}`,
  ].join(' ');
}

function OneMark({ point, direction }: { point: Point; direction: 1 | -1 }) {
  const x = point.x + direction * MARK_GAP;

  return (
    <line
      x1={x}
      y1={point.y - MARK_SIZE}
      x2={x}
      y2={point.y + MARK_SIZE}
      stroke="var(--color-brand-primary)"
      strokeWidth={1.75}
    />
  );
}

function ZeroMark({ point, direction }: { point: Point; direction: 1 | -1 }) {
  const x = point.x + direction * (MARK_GAP + MARK_SIZE * 1.8);

  return (
    <circle
      cx={x}
      cy={point.y}
      r={4}
      fill="var(--color-background)"
      stroke="var(--color-brand-primary)"
      strokeWidth={1.75}
    />
  );
}

function ManyMark({ point, direction }: { point: Point; direction: 1 | -1 }) {
  const baseX = point.x + direction * (MARK_GAP + MARK_SIZE);

  const endX = point.x + direction * (MARK_GAP + MARK_SIZE * 2.3);

  return (
    <g fill="none" stroke="var(--color-brand-primary)" strokeWidth={1.75} strokeLinecap="round">
      <line x1={baseX} y1={point.y} x2={endX} y2={point.y - MARK_SIZE} />

      <line x1={baseX} y1={point.y} x2={endX} y2={point.y} />

      <line x1={baseX} y1={point.y} x2={endX} y2={point.y + MARK_SIZE} />
    </g>
  );
}

export function LogicalRelationsLayer({ tables, containerRef }: LogicalRelationsLayerProps) {
  const [lines, setLines] = useState<RelationLine[]>([]);

  const calculateLines = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();

    const nextLines: RelationLine[] = [];

    for (const sourceTable of tables) {
      for (const foreignKey of sourceTable.foreignKeys) {
        const referencedTable = tables.find((table) => table.id === foreignKey.referencedTableId);

        if (!referencedTable) {
          continue;
        }

        /*
         * Una FK puede ser compuesta.
         *
         * No queremos dibujar 2 o 3 líneas para una misma
         * relación compuesta. Dibujamos una conexión entre
         * las tablas usando la primera columna de la FK como
         * punto de anclaje.
         */
        const sourceColumnId = foreignKey.columnIds[0];

        const referencedColumnId = foreignKey.referencedColumnIds[0];

        const sourceElements = findTableElements(container, sourceTable.id, sourceColumnId);

        const referencedElements = findTableElements(
          container,
          referencedTable.id,
          referencedColumnId,
        );

        if (!sourceElements || !referencedElements) {
          continue;
        }

        const sourceTableRect = sourceElements.table.getBoundingClientRect();

        const referencedTableRect = referencedElements.table.getBoundingClientRect();

        const sourceCenterX = sourceTableRect.left + sourceTableRect.width / 2;

        const referencedCenterX = referencedTableRect.left + referencedTableRect.width / 2;

        const sourceIsLeft = sourceCenterX < referencedCenterX;

        const sourceDirection: 1 | -1 = sourceIsLeft ? 1 : -1;

        const referencedDirection: 1 | -1 = sourceIsLeft ? -1 : 1;

        const start: Point = {
          x: (sourceIsLeft ? sourceTableRect.right : sourceTableRect.left) - containerRect.left,

          y: getCenterY(sourceElements.table, sourceElements.column, containerRect),
        };

        const end: Point = {
          x:
            (sourceIsLeft ? referencedTableRect.left : referencedTableRect.right) -
            containerRect.left,

          y: getCenterY(referencedElements.table, referencedElements.column, containerRect),
        };

        /*
         * nullable en la FK determina si la participación
         * del lado hijo es opcional.
         */
        const sourceOptional =
          sourceColumnId !== undefined
            ? (sourceTable.columns.find((column) => column.id === sourceColumnId)?.nullable ??
              false)
            : false;

        nextLines.push({
          id: foreignKey.id,
          start,
          end,
          startDirection: sourceDirection,
          endDirection: referencedDirection,
          sourceOptional,
        });
      }
    }

    setLines(nextLines);
  }, [containerRef, tables]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    /*
     * Esperamos un frame porque primero React debe montar
     * las tarjetas para poder medirlas.
     */
    const frame = requestAnimationFrame(calculateLines);

    const resizeObserver = new ResizeObserver(calculateLines);

    resizeObserver.observe(container);

    const tableElements = container.querySelectorAll<HTMLElement>('[data-logical-table-id]');

    for (const table of tableElements) {
      resizeObserver.observe(table);
    }

    window.addEventListener('resize', calculateLines);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();

      window.removeEventListener('resize', calculateLines);
    };
  }, [calculateLines, containerRef]);

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      {lines.map((line) => (
        <g key={line.id}>
          <path
            d={createPath(line.start, line.end, line.startDirection, line.endDirection)}
            fill="none"
            stroke="var(--color-brand-primary)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/*
           * Tabla referenciada = exactamente 1.
           *
           *          ||
           */}
          <OneMark point={line.end} direction={line.endDirection} />

          <OneMark
            point={{
              x: line.end.x + line.endDirection * (MARK_SIZE + 3),
              y: line.end.y,
            }}
            direction={line.endDirection}
          />

          {/*
           * Tabla que contiene la FK = lado N.
           *
           * nullable:
           *   o{  = 0..N
           *
           * NOT NULL:
           *   |{  = 1..N
           */}
          {line.sourceOptional ? (
            <ZeroMark point={line.start} direction={line.startDirection} />
          ) : (
            <OneMark point={line.start} direction={line.startDirection} />
          )}

          <ManyMark point={line.start} direction={line.startDirection} />
        </g>
      ))}
    </svg>
  );
}
