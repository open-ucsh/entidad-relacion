export interface LogicalColumn {
  id: string;
  name: string;
  primaryKey: boolean;
  nullable: boolean;
  unique: boolean;
  sourceAttributeId: string | null;
}
