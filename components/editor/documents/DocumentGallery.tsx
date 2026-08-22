'use client';

import { FilePlus, X } from 'lucide-react';

import { useCloseOnEscape } from '@/components/editor/hooks/useCloseOnEscape';
import type { DiagramDocument } from '@/state/diagram/diagram-document';
import { useDiagramStore } from '@/state/diagram/store';

import { DocumentCard } from './DocumentCard';

interface DocumentGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentGallery({ isOpen, onClose }: DocumentGalleryProps) {
  const documents = useDiagramStore((state) => state.documents);
  const activeDocumentId = useDiagramStore((state) => state.activeDocumentId);
  const createDocument = useDiagramStore((state) => state.createDocument);
  const openDocument = useDiagramStore((state) => state.openDocument);
  const duplicateDocument = useDiagramStore((state) => state.duplicateDocument);
  const deleteDocument = useDiagramStore((state) => state.deleteDocument);

  useCloseOnEscape({ isOpen, onClose });

  if (!isOpen) {
    return null;
  }

  const sortedDocuments = [...documents].sort(
    (first, second) =>
      new Date(second.diagram.metadata.updatedAt).getTime() -
      new Date(first.diagram.metadata.updatedAt).getTime(),
  );

  function handleDelete(document: DiagramDocument) {
    const shouldDelete = window.confirm(
      `¿Eliminar “${document.diagram.metadata.name}”? Esta acción no se puede deshacer.`,
    );

    if (shouldDelete) {
      deleteDocument(document.id);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-text/25 backdrop-blur-sm"
        aria-label="Cerrar documentos"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="documents-title"
        className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 id="documents-title" className="text-base font-semibold text-text">
              Mis documentos
            </h2>

            <p className="mt-0.5 text-xs text-text-muted">
              {documents.length} proyecto{documents.length === 1 ? '' : 's'} guardado
              {documents.length === 1 ? '' : 's'} localmente
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                createDocument();
                onClose();
              }}
              className="flex items-center gap-2 rounded-md bg-brand-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            >
              <FilePlus size={15} aria-hidden="true" />
              Nuevo documento
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar documentos"
              className="flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="min-h-0 overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                isActive={document.id === activeDocumentId}
                canDelete={documents.length > 1}
                onOpen={() => {
                  openDocument(document.id);
                  onClose();
                }}
                onDuplicate={() => {
                  duplicateDocument(document.id);
                }}
                onDelete={() => {
                  handleDelete(document);
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
