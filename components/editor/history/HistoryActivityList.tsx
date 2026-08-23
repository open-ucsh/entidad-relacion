import { HistoryActivityRow } from './HistoryActivityRow';

import { HistoryEmptyState } from './HistoryEmptyState';

import { groupActivityByDay } from './utils/group-activity';

import type { Activity } from './utils/group-activity';

interface HistoryActivityListProps {
  activities: Activity[];
  isActivitySelectable?: ((activity: Activity) => boolean) | undefined;
  onSelectActivity?: ((activity: Activity) => void) | undefined;
}

export function HistoryActivityList({
  activities,
  isActivitySelectable,
  onSelectActivity,
}: HistoryActivityListProps) {
  const groups = groupActivityByDay(activities);

  if (groups.length === 0) {
    return <HistoryEmptyState />;
  }

  return (
    <div className="py-3">
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="px-5 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {group.label}
          </h3>

          <ol className="px-2.5 pb-2">
            {group.rows.map((row) => {
              const canSelect = isActivitySelectable?.(row) ?? false;

              return (
                <li key={row.id}>
                  <HistoryActivityRow
                    row={row}
                    onSelect={
                      canSelect && onSelectActivity
                        ? () => {
                            onSelectActivity(row);
                          }
                        : undefined
                    }
                  />
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
