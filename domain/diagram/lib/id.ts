type DiagramIdPrefix =
  | 'activity'
  | 'attribute'
  | 'connection'
  | 'document'
  | 'entity'
  | 'relationship'
  | 'isa'
  | 'logical-table'
  | 'logical-column'
  | 'logical-foreign-key'
  | 'logical-workspace';

function createRandomValue(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createId(prefix: DiagramIdPrefix): string {
  return `${prefix}-${createRandomValue()}`;
}
