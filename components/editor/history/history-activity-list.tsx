import { HistoryActivityRow } from './history-activity-row';
import { HistoryEmptyState } from './history-empty-state';
import type { Activity } from './utils/group-activity';
import { groupActivityByDay } from './utils/group-activity';

interface HistoryActivityListProps {
  activities: Activity[];
}

export function HistoryActivityList({ activities }: HistoryActivityListProps) {
  const groups = groupActivityByDay(activities);

  if (groups.length === 0) {
    return <HistoryEmptyState />;
  }

  return (
    <>
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="sticky top-0 z-10 bg-background/95 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted backdrop-blur-sm">
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
    </>
  );
}
