'use client';

import { useEffect } from 'react';

import { useDiagramStore } from '@/state/diagram-store';

export function useCanvasKeyboard() {
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);

  const removeElement = useDiagramStore((state) => state.removeElement);

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

      if (selectedElementId) {
        removeElement(selectedElementId);
      }
    }

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [selectedElementId, removeElement, setActiveTool]);
}
