'use client';

import type { Tool } from '@/domain/models';

import { useCanvasCreate } from './useToolCreate';
import { useDiagramStore } from '@/state/diagram-store';

export function useToolSelect() {
  const setActiveTool = useDiagramStore((state) => state.setActiveTool);
  const { create } = useCanvasCreate();

  function selectTool(tool: Tool) {
    setActiveTool(tool);

    if (tool === 'entity' || tool === 'relationship' || tool === 'attribute') {
      create(tool);
    }
  }

  return { selectTool };
}
