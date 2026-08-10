import { getActivityIcon } from './utils/activity-icon';
import { formatTime } from './utils/format-history-date';
import type { ActivityRow as ActivityRowData } from './utils/group-activity';

interface HistoryActivityRowProps {
  row: ActivityRowData;
}

export function HistoryActivityRow({ row }: HistoryActivityRowProps) {
  const { Icon, className } = getActivityIcon(row.type);

  return (
    <div className="flex gap-3 px-2.5 py-2">
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${className}`}
      >
        <Icon size={14} aria-hidden="true" />
      </span>

      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <p className="text-sm leading-5 text-text">
          {row.details}
          {row.count > 1 && (
            <span className="ml-1.5 text-xs font-medium text-text-muted">×{row.count}</span>
          )}
        </p>

        <time
          dateTime={row.lastOccurredAt}
          className="mt-0.5 shrink-0 text-xs tabular-nums text-text-muted"
        >
          {formatTime(row.lastOccurredAt)}
        </time>
      </div>
    </div>
  );
}
