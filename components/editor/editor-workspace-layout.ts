const DESKTOP_TOOLBAR_WIDTH = '240px';

const DESKTOP_INSPECTOR_WIDTH = '320px';

export function getEditorWorkspaceColumns(
  isToolbarOpen: boolean,
  isInspectorOpen: boolean,
): string {
  const toolbarWidth = isToolbarOpen ? DESKTOP_TOOLBAR_WIDTH : '0px';

  const inspectorWidth = isInspectorOpen ? DESKTOP_INSPECTOR_WIDTH : '0px';

  return [toolbarWidth, 'minmax(0, 1fr)', inspectorWidth].join(' ');
}
