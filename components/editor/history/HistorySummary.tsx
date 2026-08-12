import { FolderInput } from 'lucide-react';

import { formatSummaryDate } from './utils/format-history-date';

interface HistorySummaryProps {
  createdAt: string;
  updatedAt: string;
  importedAt?: string | null;
}

export function HistorySummary({ createdAt, updatedAt, importedAt }: HistorySummaryProps) {
  return (
    <div className="border-b border-border px-5 pb-3">
      <p className="text-xs leading-5 text-text-muted">
        Creado {formatSummaryDate(createdAt)}
        <span className="mx-1.5 text-text-muted/40">·</span>
        Editado {formatSummaryDate(updatedAt)}
      </p>

      {importedAt && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700">
          <FolderInput size={12} aria-hidden="true" />
          Importado {formatSummaryDate(importedAt)}
        </p>
      )}
    </div>
  );
}
