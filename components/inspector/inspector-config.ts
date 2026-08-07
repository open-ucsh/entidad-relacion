import { Box, Circle, Diamond, Triangle } from 'lucide-react';

export const INSPECTOR_TYPE_CONFIG = {
  entity: {
    label: 'Entidad',
    icon: Box,
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/20',
  },

  relationship: {
    label: 'Relación',
    icon: Diamond,
    text: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
    ring: 'ring-violet-500/20',
  },

  attribute: {
    label: 'Atributo',
    icon: Circle,
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
  },

  isa: {
    label: 'ISA',
    icon: Triangle,
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/20',
  },
} as const;
