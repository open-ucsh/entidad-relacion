'use client';

import { Clock3, Copy, FilePlus, FileText, FolderInput, Trash2, X } from 'lucide-react';

import type { DiagramDocument } from '@/state/diagram/diagram-document';
import { useDiagramStore } from '@/state/diagram/store';

interface DocumentGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

function getOriginLabel(document: DiagramDocument): string {
  return document.diagram.metadata.origin === 'imported' ? 'Importado' : 'Creado en ER Designer';
}

export function DocumentGallery({ isOpen, onClose }: DocumentGalleryProps) {
  const documents = useDiagramStore((state) => state.documents);
  const activeDocumentId = useDiagramStore((state) => state.activeDocumentId);
  const createDocument = useDiagramStore((state) => state.createDocument);
  const openDocument = useDiagramStore((state) => state.openDocument);
  const duplicateDocument = useDiagramStore((state) => state.duplicateDocument);
  const deleteDocument = useDiagramStore((state) => state.deleteDocument);

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
            {sortedDocuments.map((document) => {
              const isActive = document.id === activeDocumentId;
              const { diagram } = document;

              return (
                <article
                  key={document.id}
                  className={`group relative rounded-lg border p-4 transition-colors ${
                    isActive
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-border bg-background hover:border-brand-primary/35 hover:bg-surface'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      openDocument(document.id);
                      onClose();
                    }}
                    className="block w-full pr-7 text-left focus-visible:outline-none"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                          isActive
                            ? 'bg-brand-primary text-white'
                            : 'bg-surface-hover text-text-muted'
                        }`}
                      >
                        <FileText size={18} aria-hidden="true" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-text">
                          {diagram.metadata.name}
                        </h3>

                        <p className="mt-1 text-xs text-text-muted">
                          {diagram.entities.length} entidades · {diagram.relationships.length}{' '}
                          relaciones
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-text-muted">
                      <p className="flex items-center gap-1.5">
                        {diagram.metadata.origin === 'imported' ? (
                          <FolderInput size={13} aria-hidden="true" />
                        ) : (
                          <Clock3 size={13} aria-hidden="true" />
                        )}
                        {getOriginLabel(document)}
                      </p>

                      <p>Última edición: {formatDate(diagram.metadata.updatedAt)}</p>
                    </div>
                  </button>

                  {isActive && (
                    <span className="absolute right-3 top-3 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                      Abierto
                    </span>
                  )}

                  <div className="mt-4 flex gap-2 border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        duplicateDocument(document.id);
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
                    >
                      <Copy size={13} aria-hidden="true" />
                      Duplicar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(document);
                      }}
                      disabled={documents.length === 1}
                      aria-label={`Eliminar ${diagram.metadata.name}`}
                      className="flex w-8 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
