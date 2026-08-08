'use client';

import { useEffect } from 'react';

import type { Tool } from '@/domain/models';
import { TOOL_GROUPS } from '@/components/toolbar/tools';
import { useDiagramStore } from '@/state/diagram-store';

import { useToolSelect } from './useToolSelect';

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
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const removeElement = useDiagramStore((state) => state.removeElement);
  const setActiveTool = useDiagramStore((state) => state.setActiveTool);
  const { selectTool } = useToolSelect();

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === 'Escape') {
        setActiveTool('select');
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedElementId) {
          event.preventDefault();
          removeElement(selectedElementId);
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
  }, [selectedElementId, removeElement, setActiveTool, selectTool]);
}
