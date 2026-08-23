import { getActivityIcon } from './utils/ActivityIcon';

import { formatTime } from './utils/format-history-date';

import type { ActivityRow as ActivityRowData } from './utils/group-activity';

interface HistoryActivityRowProps {
  row: ActivityRowData;
  onSelect?: (() => void) | undefined;
}

export function HistoryActivityRow({ row, onSelect }: HistoryActivityRowProps) {
  const { Icon, className } = getActivityIcon(row.type);

  const content = (
    <>
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${className}`}
      >
        <Icon size={14} aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <span className="text-sm leading-5 text-text">
          {row.details}

          {row.count > 1 && (
            <span className="ml-1.5 text-xs font-medium text-text-muted">×{row.count}</span>
          )}
        </span>

        <time
          dateTime={row.lastOccurredAt}
          className="mt-0.5 shrink-0 text-xs tabular-nums text-text-muted"
        >
          {formatTime(row.lastOccurredAt)}
        </time>
      </span>
    </>
  );

  if (!onSelect) {
    return <div className="flex gap-3 px-2.5 py-2">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
      title="Seleccionar elemento relacionado"
    >
      {content}
    </button>
  );
}
