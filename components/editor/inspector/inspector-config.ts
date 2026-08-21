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
    label: 'Isa',
    icon: Triangle,
    text: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    ring: 'ring-orange-500/20',
  },
} as const;
