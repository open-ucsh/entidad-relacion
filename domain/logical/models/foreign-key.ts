export interface LogicalForeignKey {
  id: string;
  columnIds: string[];
  referencedTableId: string;
  referencedColumnIds: string[];
  sourceRelationshipId: string | null;
}
