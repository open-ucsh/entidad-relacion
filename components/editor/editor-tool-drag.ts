import type { Tool } from '@/domain/diagram/models';

const EDITOR_TOOL_DRAG_TYPE = 'application/x-mer-designer-tool';

export type DraggableEditorTool = Extract<Tool, 'entity' | 'relationship' | 'attribute' | 'isa'>;

export function isDraggableEditorTool(tool: Tool): tool is DraggableEditorTool {
  return tool === 'entity' || tool === 'relationship' || tool === 'attribute' || tool === 'isa';
}

function getToolPreviewShape(tool: DraggableEditorTool): string {
  switch (tool) {
    case 'entity':
      return '<rect x="18" y="12" width="84" height="40" rx="6" fill="white" stroke="#64748b" stroke-width="2.5" />';

    case 'relationship':
      return '<polygon points="60,8 100,32 60,56 20,32" fill="white" stroke="#64748b" stroke-width="2.5" stroke-linejoin="round" />';

    case 'attribute':
      return '<ellipse cx="60" cy="32" rx="42" ry="21" fill="white" stroke="#64748b" stroke-width="2.5" />';

    case 'isa':
      return '<polygon points="60,8 100,56 20,56" fill="white" stroke="#64748b" stroke-width="2.5" stroke-linejoin="round" />';
  }
}

function setDraggedToolPreview(dataTransfer: DataTransfer, tool: DraggableEditorTool): void {
  const preview = document.createElement('div');

  preview.style.position = 'fixed';
  preview.style.top = '-1000px';
  preview.style.left = '-1000px';
  preview.style.width = '120px';
  preview.style.height = '64px';
  preview.style.pointerEvents = 'none';
  preview.style.opacity = '1';

  preview.innerHTML = `
    <svg width="120" height="64" viewBox="0 0 120 64" xmlns="http://www.w3.org/2000/svg">
      ${getToolPreviewShape(tool)}
    </svg>
  `;

  document.body.append(preview);
  dataTransfer.setDragImage(preview, 60, 32);

  requestAnimationFrame(() => {
    preview.remove();
  });
}

export function setDraggedEditorTool(dataTransfer: DataTransfer, tool: Tool): void {
  if (!isDraggableEditorTool(tool)) {
    return;
  }

  dataTransfer.effectAllowed = 'copy';
  dataTransfer.setData(EDITOR_TOOL_DRAG_TYPE, tool);
  setDraggedToolPreview(dataTransfer, tool);
}

export function getDraggedEditorTool(dataTransfer: DataTransfer): DraggableEditorTool | null {
  const tool = dataTransfer.getData(EDITOR_TOOL_DRAG_TYPE) as Tool;

  return isDraggableEditorTool(tool) ? tool : null;
}
