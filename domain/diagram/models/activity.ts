export type DiagramOrigin = 'created-in-app' | 'imported';

export type DiagramActivityType =
  | 'diagram-created'
  | 'diagram-imported'
  | 'element-created'
  | 'element-updated'
  | 'element-renamed'
  | 'elements-moved'
  | 'elements-removed'
  | 'connection-created'
  | 'connection-updated';

export interface DiagramMetadata {
  createdAt: string;
  updatedAt: string;
  origin: DiagramOrigin;
  importedAt: string | null;
}

export interface DiagramActivity {
  id: string;
  type: DiagramActivityType;
  occurredAt: string;
  details: string;
}
