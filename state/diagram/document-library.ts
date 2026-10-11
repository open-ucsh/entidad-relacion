import type { Diagram } from '@/domain/diagram/models';
import { getDiagramElements } from '@/domain/diagram/queries/elements';

import type { DiagramDocument } from './diagram-document';

export const MAX_DOCUMENTS = 4;

function hasDiagramContent(diagram: Diagram): boolean {
  return getDiagramElements(diagram).length > 0;
}

export function hasDocumentContent(document: DiagramDocument): boolean {
  return hasDiagramContent(document.diagram) || document.logicalWorkspace.model.tables.length > 0;
}

export function getStoredDocuments(documents: DiagramDocument[]): DiagramDocument[] {
  return documents.filter(hasDocumentContent);
}

export function discardEmptyDocuments(
  documents: DiagramDocument[],
  documentIdToKeep?: string,
): DiagramDocument[] {
  return documents.filter(
    (document) => document.id === documentIdToKeep || hasDocumentContent(document),
  );
}

export function hasDocumentCapacity(documents: DiagramDocument[]): boolean {
  return getStoredDocuments(documents).length < MAX_DOCUMENTS;
}
