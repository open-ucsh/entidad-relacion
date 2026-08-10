function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatTime(date: string): string {
  return new Intl.DateTimeFormat('es-CL', { timeStyle: 'short' }).format(new Date(date));
}

/** "hoy, 2:08 p. m.", "ayer, 7:40 p. m." o "9 ago 2026" para el resumen del header. */
export function formatSummaryDate(date: string): string {
  const target = new Date(date);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(target, now)) return `hoy, ${formatTime(date)}`;
  if (isSameDay(target, yesterday)) return `ayer, ${formatTime(date)}`;

  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: target.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  }).format(target);
}

/** "Hoy", "Ayer" o fecha larga, para los encabezados de sección de la lista. */
export function formatDayLabel(date: string): string {
  const target = new Date(date);
  const now = new Date();
  const startOf = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(target)) / 86_400_000);

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';

  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: target.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  }).format(target);
}
