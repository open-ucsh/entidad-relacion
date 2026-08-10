import { formatDayLabel } from './format-history-date';

export interface Activity {
  id: string;
  details: string;
  occurredAt: string;
}

export interface ActivityRow extends Activity {
  count: number;
  lastOccurredAt: string;
}

export interface ActivityGroup {
  label: string;
  rows: ActivityRow[];
}

/** Colapsa repeticiones consecutivas del mismo evento (p. ej. 5x la misma acción) en una fila con contador. */
function collapseConsecutive(activities: Activity[]): ActivityRow[] {
  const rows: ActivityRow[] = [];

  for (const activity of activities) {
    const last = rows.at(-1);

    if (last && last.details === activity.details) {
      last.count += 1;
      last.lastOccurredAt = activity.occurredAt;
    } else {
      rows.push({ ...activity, count: 1, lastOccurredAt: activity.occurredAt });
    }
  }

  return rows;
}

/** Agrupa una lista de actividad (orden reverso-cronológico) en buckets por día, ya colapsados. */
export function groupActivityByDay(activities: Activity[]): ActivityGroup[] {
  const groups: Array<{ label: string; items: Activity[] }> = [];

  for (const activity of activities) {
    const label = formatDayLabel(activity.occurredAt);
    const last = groups.at(-1);

    if (last && last.label === label) {
      last.items.push(activity);
    } else {
      groups.push({ label, items: [activity] });
    }
  }

  return groups.map((group) => ({ label: group.label, rows: collapseConsecutive(group.items) }));
}
