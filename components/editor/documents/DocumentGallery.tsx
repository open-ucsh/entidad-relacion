'use client';

import { FilePlus, X } from 'lucide-react';

import { useMemo, useState } from 'react';

import { ConfirmDialog } from '@/components/editor/feedback/ConfirmDialog';
import { useEditorFeedback } from '@/components/editor/feedback/EditorFeedbackProvider';
import { useCloseOnEscape } from '@/components/editor/hooks/useCloseOnEscape';

import type { DiagramDocument } from '@/state/diagram/diagram-document';
import { MAX_DOCUMENTS, getStoredDocuments } from '@/state/diagram/document-library';
import { useDiagramStore } from '@/state/diagram/store';

import { DocumentDetail } from './DocumentDetail';
import { DocumentListItem } from './DocumentListItem';

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

  const { showFeedback } = useEditorFeedback();

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<DiagramDocument | null>(null);

  const storedDocuments = useMemo(() => getStoredDocuments(documents), [documents]);

  useCloseOnEscape({ isOpen, onClose });

  if (!isOpen) {
    return null;
  }

  const canCreateDocument = storedDocuments.length < MAX_DOCUMENTS;

  const sortedDocuments = [...storedDocuments].sort(
    (first, second) =>
      new Date(second.diagram.metadata.updatedAt).getTime() -
      new Date(first.diagram.metadata.updatedAt).getTime(),
  );

  const selectedDocument =
    sortedDocuments.find((document) => document.id === selectedDocumentId) ??
    sortedDocuments.find((document) => document.id === activeDocumentId) ??
    sortedDocuments[0] ??
    null;

  function handleCreateDocument() {
    if (!canCreateDocument) {
      return;
    }

    createDocument();

    showFeedback({
      tone: 'success',
      message: 'Se creó un documento nuevo.',
    });

    onClose();
  }

  function handleDuplicateDocument() {
    if (!selectedDocument || !canCreateDocument) {
      return;
    }

    duplicateDocument(selectedDocument.id);

    showFeedback({
      tone: 'success',
      message: `Se duplicó “${selectedDocument.diagram.metadata.name}”.`,
    });
  }

  function handleConfirmDelete() {
    if (!documentToDelete) {
      return;
    }

    deleteDocument(documentToDelete.id);

    showFeedback({
      tone: 'success',
      message: `Se eliminó “${documentToDelete.diagram.metadata.name}”.`,
    });

    setDocumentToDelete(null);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
        <button
          type="button"
          className="absolute inset-0 bg-text/30 backdrop-blur-sm"
          aria-label="Cerrar documentos"
          onClick={onClose}
        />

        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="documents-title"
          className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-border px-7 py-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Documentos locales
              </p>

              <h2
                id="documents-title"
                className="mt-1 text-2xl font-semibold tracking-tight text-text"
              >
                Mis documentos
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canCreateDocument}
                title={
                  canCreateDocument
                    ? 'Crear documento'
                    : `Máximo de ${MAX_DOCUMENTS} documentos guardados`
                }
                onClick={handleCreateDocument}
                className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-text/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FilePlus size={16} aria-hidden="true" />
                Nuevo documento
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar documentos"
                className="ml-1 flex size-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </header>

          {!canCreateDocument && (
            <div className="border-b border-amber-200 bg-amber-50 px-7 py-3">
              <p className="text-sm text-amber-800">
                Alcanzaste el límite de {MAX_DOCUMENTS} documentos locales. Elimina uno para crear o
                duplicar otro.
              </p>
            </div>
          )}

          {sortedDocuments.length > 0 ? (
            <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.2fr)]">
              <aside className="min-h-0 overflow-y-auto border-b border-border bg-surface lg:border-b-0 lg:border-r">
                <div className="border-b border-border px-5 py-3">
                  <p className="text-xs text-text-muted">
                    {storedDocuments.length} de {MAX_DOCUMENTS} documentos guardados
                  </p>
                </div>

                {sortedDocuments.map((document) => (
                  <DocumentListItem
                    key={document.id}
                    document={document}
                    selected={document.id === selectedDocument?.id}
                    isActive={document.id === activeDocumentId}
                    onSelect={() => {
                      setSelectedDocumentId(document.id);
                    }}
                  />
                ))}
              </aside>

              {selectedDocument && (
                <DocumentDetail
                  document={selectedDocument}
                  canDuplicate={canCreateDocument}
                  onOpen={() => {
                    openDocument(selectedDocument.id);
                    onClose();
                  }}
                  onDuplicate={handleDuplicateDocument}
                  onDelete={() => {
                    setDocumentToDelete(selectedDocument);
                  }}
                />
              )}
            </div>
          ) : (
            <div className="flex min-h-72 flex-1 flex-col items-center justify-center px-6 text-center">
              <p className="text-sm font-semibold text-text">Aún no hay diagramas guardados</p>

              <p className="mt-1 max-w-sm text-sm leading-6 text-text-muted">
                Los documentos aparecerán aquí cuando agregues al menos un elemento al lienzo.
              </p>
            </div>
          )}

          <footer className="border-t border-border px-7 py-4">
            <p className="text-xs text-text-muted">
              {storedDocuments.length} proyecto{storedDocuments.length === 1 ? '' : 's'} guardado
              {storedDocuments.length === 1 ? '' : 's'} localmente
            </p>
          </footer>
        </section>
      </div>

      <ConfirmDialog
        isOpen={documentToDelete !== null}
        title="¿Eliminar documento?"
        description={
          documentToDelete
            ? `Eliminarás “${documentToDelete.diagram.metadata.name}”. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar documento"
        onCancel={() => {
          setDocumentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
