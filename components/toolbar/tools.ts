import { Circle, Diamond, MousePointer2, MoveRight, Square, Trash2, Triangle } from 'lucide-react';

export const TOOL_GROUPS = [
  {
    title: 'Elementos',
    items: [
      {
        id: 'entity',
        label: 'Entidad',
        icon: Square,
        shortcut: 'E',
      },
      {
        id: 'relationship',
        label: 'Relación',
        icon: Diamond,
        shortcut: 'R',
      },
      {
        id: 'attribute',
        label: 'Atributo',
        icon: Circle,
        shortcut: 'A',
      },
      {
        id: 'isa',
        label: 'ISA',
        icon: Triangle,
        shortcut: 'I',
      },
    ],
  },
  {
    title: 'Herramientas',
    items: [
      {
        id: 'select',
        label: 'Seleccionar',
        icon: MousePointer2,
        shortcut: 'V',
      },
      {
        id: 'connect',
        label: 'Conectar',
        icon: MoveRight,
        shortcut: 'C',
      },
      {
        id: 'delete',
        label: 'Borrar',
        icon: Trash2,
        shortcut: 'D',
      },
    ],
  },
] as const;
