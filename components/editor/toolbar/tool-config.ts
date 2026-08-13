import {
  Circle,
  Diamond,
  MousePointer2,
  MoveRight,
  Square,
  Trash2,
  type LucideIcon,
} from 'lucide-react';

import type { Tool } from '@/domain/diagram/models';

export interface ToolbarTool {
  id: Tool;
  label: string;
  icon: LucideIcon;
  shortcut: string;
}

export interface ToolbarToolGroup {
  title: string;
  items: ToolbarTool[];
}

export const TOOL_GROUPS: ToolbarToolGroup[] = [
  {
    title: 'Figuras',
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
];

const TOOLS = TOOL_GROUPS.flatMap((group) => group.items);

export function getToolFromShortcut(key: string): Tool | undefined {
  const normalizedKey = key.toUpperCase();

  return TOOLS.find((tool) => tool.shortcut === normalizedKey)?.id;
}
