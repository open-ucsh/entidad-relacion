const TOOLBAR_WIDTH = '240px';
const INSPECTOR_WIDTH = '320px';

export function getEditorWorkspaceColumns(
  isToolbarOpen: boolean,
  isInspectorOpen: boolean,
): string {
  const toolbarWidth = isToolbarOpen ? TOOLBAR_WIDTH : '0px';
  const inspectorWidth = isInspectorOpen ? INSPECTOR_WIDTH : '0px';

  return [toolbarWidth, 'minmax(0, 1fr)', inspectorWidth].join(' ');
}
