'use client';

import { useCallback, useState, type DragEvent } from 'react';

import { getDraggedEditorTool } from '@/components/editor/editor-tool-drag';

import type { DiagramElement, Point, Tool } from '@/domain/diagram/models';

interface UseCanvasToolDropOptions {
  getWorldPoint: (event: { clientX: number; clientY: number }) => Point | null;
  createDiagramElementAt: (
    tool: 'entity' | 'relationship' | 'attribute' | 'isa',
    position: Point,
  ) => DiagramElement;
  startEditingElement: (element: DiagramElement) => void;
  setActiveTool: (tool: Tool) => void;
}

export function useCanvasToolDrop({
  getWorldPoint,
  createDiagramElementAt,
  startEditingElement,
  setActiveTool,
}: UseCanvasToolDropOptions) {
  const [isToolDragOver, setIsToolDragOver] = useState(false);

  const handleToolDragOver = useCallback((event: DragEvent<SVGSVGElement>) => {
    const tool = getDraggedEditorTool(event.dataTransfer);

    if (!tool) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsToolDragOver(true);
  }, []);

  const handleToolDragLeave = useCallback((event: DragEvent<SVGSVGElement>) => {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setIsToolDragOver(false);
  }, []);

  const handleToolDrop = useCallback(
    (event: DragEvent<SVGSVGElement>) => {
      event.preventDefault();
      setIsToolDragOver(false);

      const tool = getDraggedEditorTool(event.dataTransfer);

      if (!tool) {
        return;
      }

      const point = getWorldPoint(event.nativeEvent);

      if (!point) {
        return;
      }

      const element = createDiagramElementAt(tool, point);

      if (element.type !== 'isa') {
        startEditingElement(element);
      }

      setActiveTool('select');
    },
    [createDiagramElementAt, getWorldPoint, setActiveTool, startEditingElement],
  );

  return {
    isToolDragOver,
    handleToolDragOver,
    handleToolDragLeave,
    handleToolDrop,
  };
}
