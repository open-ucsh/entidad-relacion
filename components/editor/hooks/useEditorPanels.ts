'use client';

import { useMemo, useState } from 'react';

import { getEditorWorkspaceColumns } from '../editor-workspace-layout';

export function useEditorPanels() {
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  const workspaceColumns = useMemo(
    () => getEditorWorkspaceColumns(isToolbarOpen, isInspectorOpen),
    [isInspectorOpen, isToolbarOpen],
  );

  return {
    isToolbarOpen,
    isInspectorOpen,
    workspaceColumns,
    toggleToolbar: () => {
      setIsToolbarOpen((open) => !open);
    },
    toggleInspector: () => {
      setIsInspectorOpen((open) => !open);
    },
  };
}
