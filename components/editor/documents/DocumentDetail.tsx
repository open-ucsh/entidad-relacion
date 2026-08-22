import { Copy, FolderOpen, Trash2 } from 'lucide-react';

import type { DiagramDocument } from '@/state/diagram/diagram-document';

import { DocumentPreview } from './DocumentPreview';

interface DocumentDetailProps {
  document: DiagramDocument;
  canDuplicate: boolean;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

function getOriginLabel(document: DiagramDocument): string {
  return document.diagram.metadata.origin === 'imported' ? 'Importado' : 'Creado aquí';
}

export function DocumentDetail({
  document,
  canDuplicate,
  onOpen,
  onDuplicate,
  onDelete,
}: DocumentDetailProps) {
  const { diagram } = document;

  return (
    <section className="flex min-h-0 flex-col bg-background p-6">
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="h-52 sm:h-60">
          <DocumentPreview diagram={diagram} appearance={document.appearance} />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Vista previa</p>

        <div className="mt-1 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold tracking-tight text-text">
              {diagram.metadata.name}
            </h3>

            <p className="mt-2 text-sm text-text-muted">
              {diagram.entities.length} entidades · {diagram.relationships.length} relaciones ·{' '}
              {getOriginLabel(document)}
            </p>
          </div>

          <time
            dateTime={diagram.metadata.updatedAt}
            className="shrink-0 pt-1 text-right text-xs tabular-nums text-text-muted"
          >
            {formatDate(diagram.metadata.updatedAt)}
          </time>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-5">
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2 rounded-lg bg-text px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-text/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        >
          <FolderOpen size={16} aria-hidden="true" />
          Abrir documento
        </button>

        <button
          type="button"
          onClick={onDuplicate}
          disabled={!canDuplicate}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Copy size={15} aria-hidden="true" />
          Duplicar
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="ml-auto flex size-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          aria-label={`Eliminar ${diagram.metadata.name}`}
          title={`Eliminar ${diagram.metadata.name}`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
