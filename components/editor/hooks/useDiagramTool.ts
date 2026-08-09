'use client';

import type { Tool } from '@/domain/diagram/models';
import { useDiagramStore } from '@/state/diagram/diagram.store';

export function useDiagramTool() {
  const setActiveTool = useDiagramStore((state) => state.setActiveTool);

  function activateTool(tool: Tool) {
    setActiveTool(tool);
  }

  return {
    activateTool,
  };
}
