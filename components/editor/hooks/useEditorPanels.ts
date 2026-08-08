'use client';

import { useMemo, useState } from 'react';

const TOOLBAR_WIDTH = '240px';
const INSPECTOR_WIDTH = '320px';

function getWorkspaceColumns(toolbarOpen: boolean, inspectorOpen: boolean): string {
  return [
    toolbarOpen ? TOOLBAR_WIDTH : '0px',
    'minmax(0, 1fr)',
    inspectorOpen ? INSPECTOR_WIDTH : '0px',
  ].join(' ');
}

export function useEditorPanels() {
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  const workspaceColumns = useMemo(
    () => getWorkspaceColumns(isToolbarOpen, isInspectorOpen),
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
