export type LogicalRelationMinimum = 0 | 1;
export type LogicalRelationMaximum = 1 | 'N';

export interface LogicalRelationCardinality {
  minimum: LogicalRelationMinimum;
  maximum: LogicalRelationMaximum;
}

export interface LogicalForeignKey {
  id: string;

  columnIds: string[];

  referencedTableId: string;
  referencedColumnIds: string[];

  sourceRelationshipId: string | null;

  sourceCardinality: LogicalRelationCardinality;
  referencedCardinality: LogicalRelationCardinality;
}
