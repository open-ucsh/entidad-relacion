'use client';

import { useEffect } from 'react';

import { useDiagramStore } from '@/state/diagram-store';

export function useCanvasKeyboard() {
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);

  const selectedConnectionId = useDiagramStore((state) => state.selectedConnectionId);

  const removeElement = useDiagramStore((state) => state.removeElement);

  const removeConnection = useDiagramStore((state) => state.removeConnection);

  const setActiveTool = useDiagramStore((state) => state.setActiveTool);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveTool('select');
        return;
      }

      if (event.key !== 'Delete') {
        return;
      }

      if (selectedConnectionId) {
        removeConnection(selectedConnectionId);
        return;
      }

      if (selectedElementId) {
        removeElement(selectedElementId);
      }
    }

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [selectedElementId, selectedConnectionId, removeElement, removeConnection, setActiveTool]);
}
