import type { DiagramActivity } from '@/domain/diagram/models';

import { formatDayLabel } from './format-history-date';

export type Activity = DiagramActivity;

export interface ActivityRow extends Activity {
  count: number;
  lastOccurredAt: string;
}

export interface ActivityGroup {
  label: string;
  rows: ActivityRow[];
}

function collapseConsecutive(activities: Activity[]): ActivityRow[] {
  const rows: ActivityRow[] = [];

  for (const activity of activities) {
    const last = rows.at(-1);

    if (last && last.type === activity.type && last.details === activity.details) {
      last.count += 1;
      last.lastOccurredAt = activity.occurredAt;
      continue;
    }

    rows.push({
      ...activity,
      count: 1,
      lastOccurredAt: activity.occurredAt,
    });
  }

  return rows;
}

export function groupActivityByDay(activities: Activity[]): ActivityGroup[] {
  const groups: Array<{ label: string; items: Activity[] }> = [];

  for (const activity of activities) {
    const label = formatDayLabel(activity.occurredAt);
    const last = groups.at(-1);

    if (last && last.label === label) {
      last.items.push(activity);
      continue;
    }

    groups.push({
      label,
      items: [activity],
    });
  }

  return groups.map((group) => ({
    label: group.label,
    rows: collapseConsecutive(group.items),
  }));
}
