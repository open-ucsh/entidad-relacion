import { Circle, Diamond, Square, Triangle } from 'lucide-react';

export const INSPECTOR_TYPE_CONFIG = {
  entity: {
    label: 'Entidad',
    icon: Square,
    text: 'text-brand-primary',
    bg: 'bg-brand-primary/10',
    ring: 'ring-brand-primary/15',
  },
  relationship: {
    label: 'Relación',
    icon: Diamond,
    text: 'text-brand-primary',
    bg: 'bg-brand-primary/10',
    ring: 'ring-brand-primary/15',
  },
  attribute: {
    label: 'Atributo',
    icon: Circle,
    text: 'text-brand-primary',
    bg: 'bg-brand-primary/10',
    ring: 'ring-brand-primary/15',
  },
  isa: {
    label: 'ISA',
    icon: Triangle,
    text: 'text-brand-primary',
    bg: 'bg-brand-primary/10',
    ring: 'ring-brand-primary/15',
  },
} as const;
