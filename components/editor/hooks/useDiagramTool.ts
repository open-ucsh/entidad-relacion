import type { Tool } from '@/domain/diagram/models';

import { useDiagramStore } from '@/state/diagram/diagram.store';

import { useCreateDiagramElement } from './useCreateDiagramElement';

function isCreatableTool(tool: Tool): tool is 'entity' | 'relationship' | 'attribute' {
  return tool === 'entity' || tool === 'relationship' || tool === 'attribute';
}

export function useDiagramTool() {
  const setActiveTool = useDiagramStore((state) => state.setActiveTool);
  const { createDiagramElement } = useCreateDiagramElement();

  function activateTool(tool: Tool) {
    setActiveTool(tool);

    if (isCreatableTool(tool)) {
      createDiagramElement(tool);
    }
  }

  return {
    activateTool,
  };
}
