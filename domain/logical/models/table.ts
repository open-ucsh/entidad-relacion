import type { LogicalColumn } from './column';
import type { LogicalForeignKey } from './foreign-key';

export type LogicalTableSourceType = 'entity' | 'relationship' | 'attribute';

export interface LogicalTable {
  id: string;
  name: string;
  columns: LogicalColumn[];
  foreignKeys: LogicalForeignKey[];
  sourceElementId: string;
  sourceType: LogicalTableSourceType;
}
