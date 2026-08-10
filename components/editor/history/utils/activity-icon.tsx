import { CircleDot, Link2, PenLine, Plus, Trash2, type LucideIcon } from 'lucide-react';

interface ActivityIcon {
  Icon: LucideIcon;
  className: string;
}

/**
 * Infiere un ícono y color a partir del texto del evento.
 * Si el backend algún día expone un `type` explícito, reemplazar esto por un switch sobre ese campo.
 */
export function getActivityIcon(details: string): ActivityIcon {
  if (/^Se eliminar/i.test(details)) {
    return { Icon: Trash2, className: 'bg-rose-500/10 text-rose-600' };
  }

  if (/^Se cre[oó]/i.test(details)) {
    return { Icon: Plus, className: 'bg-emerald-500/10 text-emerald-600' };
  }

  if (/^Se renombr[oó]/i.test(details)) {
    return { Icon: PenLine, className: 'bg-brand-primary/10 text-brand-primary' };
  }

  if (/cardinalidad|conexi[oó]n/i.test(details)) {
    return { Icon: Link2, className: 'bg-amber-500/10 text-amber-600' };
  }

  return { Icon: CircleDot, className: 'bg-surface text-text-muted' };
}
