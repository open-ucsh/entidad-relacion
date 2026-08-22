import type { DiagramDocument } from '@/state/diagram/diagram-document';

interface DocumentListItemProps {
  document: DiagramDocument;
  selected: boolean;
  isActive: boolean;
  onSelect: () => void;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
  }).format(new Date(date));
}

export function DocumentListItem({
  document,
  selected,
  isActive,
  onSelect,
}: DocumentListItemProps) {
  const { diagram } = document;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full border-b border-border px-5 py-4 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary ${
        selected ? 'bg-surface' : 'bg-background hover:bg-surface-hover/60'
      }`}
    >
      {isActive && <span className="absolute inset-y-4 left-0 w-0.5 bg-brand-primary" />}

      <h3 className="truncate text-sm font-semibold text-text">{diagram.metadata.name}</h3>

      <p className="mt-1 text-xs text-text-muted">
        {diagram.entities.length} entidades · {diagram.relationships.length} relaciones
      </p>

      <time
        dateTime={diagram.metadata.updatedAt}
        className="mt-3 block text-[11px] tabular-nums text-text-muted"
      >
        {formatDate(diagram.metadata.updatedAt)}
      </time>
    </button>
  );
}
