export function toLogicalName(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

export function createEntityTableId(entityId: string): string {
  return `logical:table:entity:${entityId}`;
}

export function createRelationshipTableId(relationshipId: string): string {
  return `logical:table:relationship:${relationshipId}`;
}

export function createMultivaluedTableId(attributeId: string): string {
  return `logical:table:attribute:${attributeId}`;
}

export function createAttributeColumnId(attributeId: string): string {
  return `logical:column:attribute:${attributeId}`;
}

export function createForeignColumnId(sourceId: string, referencedColumnId: string): string {
  return `logical:column:foreign:${sourceId}:${referencedColumnId}`;
}

export function createForeignKeyId(sourceId: string, referencedTableId: string): string {
  return `logical:fk:${sourceId}:${referencedTableId}`;
}
