import {
  CircleDot,
  FileDown,
  FilePlus,
  Link2,
  Move,
  PenLine,
  Plus,
  Trash2,
  type LucideIcon,
} from 'lucide-react';

import type { DiagramActivityType } from '@/domain/diagram/models';

interface ActivityIcon {
  Icon: LucideIcon;
  className: string;
}

export function getActivityIcon(type: DiagramActivityType): ActivityIcon {
  switch (type) {
    case 'diagram-created':
      return {
        Icon: FilePlus,
        className: 'bg-emerald-500/10 text-emerald-600',
      };

    case 'diagram-imported':
      return {
        Icon: FileDown,
        className: 'bg-amber-500/10 text-amber-600',
      };

    case 'diagram-renamed':
    case 'element-renamed':
      return {
        Icon: PenLine,
        className: 'bg-brand-primary/10 text-brand-primary',
      };

    case 'element-created':
      return {
        Icon: Plus,
        className: 'bg-emerald-500/10 text-emerald-600',
      };

    case 'elements-moved':
      return {
        Icon: Move,
        className: 'bg-violet-500/10 text-violet-600',
      };

    case 'elements-removed':
      return {
        Icon: Trash2,
        className: 'bg-rose-500/10 text-rose-600',
      };

    case 'connection-created':
    case 'connection-updated':
      return {
        Icon: Link2,
        className: 'bg-amber-500/10 text-amber-600',
      };

    case 'element-updated':
      return {
        Icon: CircleDot,
        className: 'bg-surface text-text-muted',
      };
  }
}
