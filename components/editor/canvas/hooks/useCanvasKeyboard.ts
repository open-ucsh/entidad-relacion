'use client';

import { useEffect, useRef, useState } from 'react';

import { useDiagramTool } from '@/components/editor/hooks/useDiagramTool';
import { getToolFromShortcut } from '@/components/editor/toolbar/tool-config';
import { useDiagramStore } from '@/state/diagram/store';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

export function useCanvasKeyboard() {
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const spacePressedRef = useRef(false);

  const selectedElementIds = useDiagramStore((state) => state.selectedElementIds);

  const removeElements = useDiagramStore((state) => state.removeElements);
  const duplicateSelectedElements = useDiagramStore((state) => state.duplicateSelectedElements);
  const selectAllElements = useDiagramStore((state) => state.selectAllElements);
  const setActiveTool = useDiagramStore((state) => state.setActiveTool);
  const undo = useDiagramStore((state) => state.undo);
  const redo = useDiagramStore((state) => state.redo);

  const { activateTool } = useDiagramTool();

  useEffect(() => {
    function resetSpaceKey() {
      spacePressedRef.current = false;
      setIsSpacePressed(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      const isSpaceKey = event.code === 'Space' || event.key === ' ';

      if (isSpaceKey && !isTypingTarget(event.target)) {
        event.preventDefault();
        spacePressedRef.current = true;
        setIsSpacePressed(true);
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      const hasModifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (hasModifier && key === 'z') {
        event.preventDefault();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }

        return;
      }

      if (hasModifier && key === 'y') {
        event.preventDefault();
        redo();
        return;
      }

      if (hasModifier && key === 'a') {
        event.preventDefault();
        selectAllElements();
        return;
      }

      if (hasModifier && key === 'd') {
        event.preventDefault();
        duplicateSelectedElements();
        return;
      }

      // Deja que el navegador use Ctrl/Cmd/Alt para sus propios atajos:
      // Ctrl+R, Ctrl+Shift+R, Ctrl+L, Cmd+R, etc.
      if (hasModifier || event.altKey) {
        return;
      }

      if (event.key === 'Escape') {
        setActiveTool('select');
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedElementIds.length > 0) {
          event.preventDefault();
          removeElements(selectedElementIds);
        }

        return;
      }

      const tool = getToolFromShortcut(event.key);

      if (tool) {
        event.preventDefault();
        activateTool(tool);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.code === 'Space' || event.key === ' ') {
        resetSpaceKey();
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', resetSpaceKey);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', resetSpaceKey);
    };
  }, [
    activateTool,
    duplicateSelectedElements,
    redo,
    removeElements,
    selectAllElements,
    selectedElementIds,
    setActiveTool,
    undo,
  ]);

  return {
    isSpacePressed,
    spacePressedRef,
  };
}
