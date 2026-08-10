'use client';

import { useCallback, useRef, useState } from 'react';

import type { Diagram, DiagramElement } from '@/domain/diagram/models';
import { findDiagramElement } from '@/domain/diagram/queries/elements';

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

  const startEditingElement = useCallback(
    (element: DiagramElement) => {
      skipCommitRef.current = false;
      onSelectElement(element.id);
      setEditingName(element.name);
      setEditingElementId(element.id);
    },
    [onSelectElement],
  );

  const startEditing = useCallback(
    (id: string) => {
      const element = findDiagramElement(diagram, id);

      if (element) {
        startEditingElement(element);
      }
    },
    [diagram, startEditingElement],
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
    startEditingElement,
    cancelEditing,
    saveEditing,
  };
}
