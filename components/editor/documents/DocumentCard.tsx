import { Clock3, Copy, FileText, FolderInput, Trash2 } from 'lucide-react';

import type { DiagramDocument } from '@/state/diagram/diagram-document';

interface DocumentCardProps {
  document: DiagramDocument;
  isActive: boolean;
  canDelete: boolean;
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
  return document.diagram.metadata.origin === 'imported' ? 'Importado' : 'Creado en ER Designer';
}

export function DocumentCard({
  document,
  isActive,
  canDelete,
  onOpen,
  onDuplicate,
  onDelete,
}: DocumentCardProps) {
  const { diagram } = document;

  return (
    <article
      className={`group relative rounded-lg border p-4 transition-colors ${
        isActive
          ? 'border-brand-primary bg-brand-primary/5'
          : 'border-border bg-background hover:border-brand-primary/35 hover:bg-surface'
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="block w-full pr-7 text-left focus-visible:outline-none"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
              isActive ? 'bg-brand-primary text-white' : 'bg-surface-hover text-text-muted'
            }`}
          >
            <FileText size={18} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-text">{diagram.metadata.name}</h3>

            <p className="mt-1 text-xs text-text-muted">
              {diagram.entities.length} entidades · {diagram.relationships.length} relaciones
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
          onClick={onDuplicate}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          <Copy size={13} aria-hidden="true" />
          Duplicar
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={!canDelete}
          aria-label={`Eliminar ${diagram.metadata.name}`}
          className="flex w-8 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
