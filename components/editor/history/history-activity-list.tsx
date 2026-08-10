import { HistoryActivityRow } from './history-activity-row';
import { HistoryEmptyState } from './history-empty-state';
import { groupActivityByDay } from './utils/group-activity';
import type { Activity } from './utils/group-activity';

interface HistoryActivityListProps {
  activities: Activity[];
}

export function HistoryActivityList({ activities }: HistoryActivityListProps) {
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
            {group.rows.map((row) => (
              <li key={row.id}>
                <HistoryActivityRow row={row} />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
