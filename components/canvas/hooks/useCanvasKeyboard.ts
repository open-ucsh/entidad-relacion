'use client';

import { useEffect } from 'react';

import { TOOL_GROUPS } from '@/components/toolbar/tools';
import type { Tool } from '@/domain/models';
import { useDiagramStore } from '@/state/diagram-store';

import { useToolSelect } from '../../editor/hooks/useToolSelect';

const SHORTCUT_MAP = new Map<string, Tool>();

for (const group of TOOL_GROUPS) {
  for (const item of group.items) {
    SHORTCUT_MAP.set(item.shortcut.toUpperCase(), item.id);
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

export function useCanvasKeyboard() {
  const selectedElementIds = useDiagramStore((state) => state.selectedElementIds);
  const removeElements = useDiagramStore((state) => state.removeElements);
  const selectAllElements = useDiagramStore((state) => state.selectAllElements);
  const setActiveTool = useDiagramStore((state) => state.setActiveTool);
  const { selectTool } = useToolSelect();

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        selectAllElements();
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

      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === 'a') {
          event.preventDefault();
          selectAllElements();
        }

        return;
      }

      const tool = SHORTCUT_MAP.get(event.key.toUpperCase());

      if (tool) {
        event.preventDefault();
        selectTool(tool);
      }
    }

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [removeElements, selectAllElements, selectedElementIds, selectTool, setActiveTool]);
}
