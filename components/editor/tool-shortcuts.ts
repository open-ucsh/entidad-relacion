import type { Tool } from '@/domain/diagram/models';

const TOOL_SHORTCUTS: Readonly<Record<string, Tool>> = {
  A: 'attribute',
  C: 'connect',
  D: 'delete',
  E: 'entity',
  R: 'relationship',
  V: 'select',
};

export function getToolFromShortcut(key: string): Tool | undefined {
  return TOOL_SHORTCUTS[key.toUpperCase()];
}
