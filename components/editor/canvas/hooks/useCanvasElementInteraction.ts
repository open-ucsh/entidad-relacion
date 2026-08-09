import type { MouseEvent, PointerEvent } from 'react';

import type { Tool } from '@/domain/diagram/models';

interface UseCanvasElementInteractionProps {
  activeTool: Tool;
  selectedElementIds: string[];
  connectionSourceId: string | null;
  onSelectElement: (id: string) => void;
  onToggleElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onElementPointerDown: (event: PointerEvent<SVGGElement>, id: string) => void;
  onConnectClick: (id: string) => void;
  onEditElement: (id: string) => void;
}

export function useCanvasElementInteraction({
  activeTool,
  selectedElementIds,
  connectionSourceId,
  onSelectElement,
  onToggleElement,
  onDeleteElement,
  onElementPointerDown,
  onConnectClick,
  onEditElement,
}: UseCanvasElementInteractionProps) {
  function isSelected(id: string): boolean {
    return selectedElementIds.includes(id) || connectionSourceId === id;
  }

  function handleElementClick(event: MouseEvent<SVGGElement>, id: string) {
    if (activeTool === 'delete') {
      onDeleteElement(id);
      return;
    }

    if (activeTool === 'connect') {
      onConnectClick(id);
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      onToggleElement(id);
      return;
    }

    onSelectElement(id);
  }

  function handleConnectionClick(event: MouseEvent<SVGGElement>, id: string) {
    if (activeTool === 'delete') {
      onDeleteElement(id);
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      onToggleElement(id);
      return;
    }

    onSelectElement(id);
  }

  function handleElementPointerDown(event: PointerEvent<SVGGElement>, id: string) {
    event.stopPropagation();

    if (activeTool === 'delete' || activeTool === 'connect') {
      return;
    }

    onElementPointerDown(event, id);
  }

  function handleElementDoubleClick(id: string) {
    if (activeTool === 'select') {
      onEditElement(id);
    }
  }

  return {
    isSelected,
    handleElementClick,
    handleConnectionClick,
    handleElementPointerDown,
    handleElementDoubleClick,
  };
}
