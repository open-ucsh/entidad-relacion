import type { LogicalRelationCardinality, LogicalTable } from '@/domain/logical/models';

import {
  findTableElements,
  getConnectionPoint,
  getConnectionSides,
  type Point,
  type Side,
} from './connection-geometry';

export interface RelationLine {
  id: string;
  sourceTableId: string;
  referencedTableId: string;
  start: Point;
  end: Point;
  startSide: Side;
  endSide: Side;
  sourceCardinality: LogicalRelationCardinality;
  referencedCardinality: LogicalRelationCardinality;
}

interface CalculateRelationLinesOptions {
  container: HTMLElement;
  tables: LogicalTable[];
  zoom: number;
}

export function calculateRelationLines({
  container,
  tables,
  zoom,
}: CalculateRelationLinesOptions): RelationLine[] {
  const containerRect = container.getBoundingClientRect();

  const lines: RelationLine[] = [];

  for (const sourceTable of tables) {
    for (const foreignKey of sourceTable.foreignKeys) {
      const referencedTable = tables.find((table) => table.id === foreignKey.referencedTableId);

      if (!referencedTable) {
        continue;
      }

      const sourceElements = findTableElements(container, sourceTable.id, foreignKey.columnIds[0]);

      const referencedElements = findTableElements(
        container,
        referencedTable.id,
        foreignKey.referencedColumnIds[0],
      );

      if (!sourceElements || !referencedElements) {
        continue;
      }

      const sourceRect = sourceElements.table.getBoundingClientRect();

      const targetRect = referencedElements.table.getBoundingClientRect();

      const { sourceSide, targetSide } = getConnectionSides(sourceRect, targetRect);

      lines.push({
        id: foreignKey.id,
        sourceTableId: sourceTable.id,
        referencedTableId: referencedTable.id,
        start: getConnectionPoint(sourceElements, sourceSide, containerRect, zoom),
        end: getConnectionPoint(referencedElements, targetSide, containerRect, zoom),
        startSide: sourceSide,
        endSide: targetSide,
        sourceCardinality: foreignKey.sourceCardinality,
        referencedCardinality: foreignKey.referencedCardinality,
      });
    }
  }

  return lines;
}
