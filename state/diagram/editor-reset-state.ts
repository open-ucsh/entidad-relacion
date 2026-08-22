export function createEditorResetState() {
  return {
    selectedElementId: null,
    selectedElementIds: [],
    connectionSourceId: null,
    activeTool: 'select' as const,
  };
}
