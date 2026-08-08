'use client';

import { useCallback, useRef, useState } from 'react';

import type { Diagram } from '@/domain/diagram/models';
import { findDiagramElement, type DiagramElement } from '@/domain/diagram/queries/elements';

interface UseInlineElementNameEditingProps {
  diagram: Diagram;
  onSelectElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
}

export function useInlineElementNameEditing({
  diagram,
  onSelectElement,
  updateElement,
}: UseInlineElementNameEditingProps) {
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const skipCommitRef = useRef(false);

  const editingElement = editingElementId
    ? findDiagramElement(diagram, editingElementId)
    : undefined;

  const startEditing = useCallback(
    (id: string) => {
      const element = findDiagramElement(diagram, id);

      if (!element) {
        return;
      }

      skipCommitRef.current = false;
      onSelectElement(id);
      setEditingName(element.name);
      setEditingElementId(id);
    },
    [diagram, onSelectElement],
  );

  const cancelEditing = useCallback(() => {
    skipCommitRef.current = true;
    setEditingElementId(null);
  }, []);

  const saveEditing = useCallback(() => {
    if (skipCommitRef.current) {
      skipCommitRef.current = false;
      return;
    }

    const name = editingName.trim();

    if (editingElementId && name) {
      updateElement(editingElementId, { name });
    }

    setEditingElementId(null);
  }, [editingElementId, editingName, updateElement]);

  return {
    editingElement,
    editingName,
    setEditingName,
    startEditing,
    cancelEditing,
    saveEditing,
  };
}
