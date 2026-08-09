'use client';

import { useEffect } from 'react';

import { useDiagramTool } from '@/components/editor/hooks/useDiagramTool';
import { getToolFromShortcut } from '@/components/editor/tool-shortcuts';
import { findDiagramElement } from '@/domain/diagram/queries/elements';
import { useDiagramStore } from '@/state/diagram/diagram.store';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

export function useCanvasKeyboard() {
  const diagram = useDiagramStore((state) => state.diagram);
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const selectedElementIds = useDiagramStore((state) => state.selectedElementIds);

  const removeElements = useDiagramStore((state) => state.removeElements);
  const duplicateSelectedElements = useDiagramStore((state) => state.duplicateSelectedElements);
  const createConnectedAttribute = useDiagramStore((state) => state.createConnectedAttribute);
  const selectAllElements = useDiagramStore((state) => state.selectAllElements);
  const setActiveTool = useDiagramStore((state) => state.setActiveTool);
  const undo = useDiagramStore((state) => state.undo);
  const redo = useDiagramStore((state) => state.redo);

  const { activateTool } = useDiagramTool();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
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

      if (!hasModifier && key === 'a' && selectedElementId) {
        const selectedElement = findDiagramElement(diagram, selectedElementId);

        if (selectedElement && selectedElement.type !== 'attribute') {
          event.preventDefault();
          createConnectedAttribute(selectedElement.id);
          return;
        }
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

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activateTool,
    createConnectedAttribute,
    diagram,
    duplicateSelectedElements,
    redo,
    removeElements,
    selectAllElements,
    selectedElementId,
    selectedElementIds,
    setActiveTool,
    undo,
  ]);
}
