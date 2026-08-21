import type { Tool } from '@/domain/diagram/models';

export function isCreatableTool(
  tool: Tool,
): tool is 'entity' | 'relationship' | 'attribute' | 'isa' {
  return tool === 'entity' || tool === 'relationship' || tool === 'attribute' || tool === 'isa';
}

export function getElementIdAtPoint(clientX: number, clientY: number): string | null {
  const target = document.elementFromPoint(clientX, clientY);

  if (!(target instanceof Element)) {
    return null;
  }

  return (
    target.closest('[data-diagram-element-id]')?.getAttribute('data-diagram-element-id') ?? null
  );
}
