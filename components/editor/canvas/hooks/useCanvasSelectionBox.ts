'use client';

import { useCallback, useRef, useState, type PointerEvent, type RefObject } from 'react';

import type { Diagram } from '@/domain/diagram/models';
import { getDiagramElements } from '@/domain/diagram/queries/elements';

import type { CanvasCamera, CanvasSize } from './useCanvasCamera';

export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasPoint {
  x: number;
  y: number;
}

interface SelectionSession {
  startPoint: CanvasPoint;
  additive: boolean;
  hasMoved: boolean;
}

interface UseCanvasSelectionBoxProps {
  diagram: Diagram;
  svgRef: RefObject<SVGSVGElement | null>;
  canvasSize: CanvasSize;
  camera: CanvasCamera;
  selectedElementIds: string[];
  setSelectedElements: (ids: string[]) => void;
  clearSelection: () => void;
}

const MOVEMENT_THRESHOLD = 3;

function getSelectionBox(startPoint: CanvasPoint, endPoint: CanvasPoint): SelectionBox {
  return {
    x: Math.min(startPoint.x, endPoint.x),
    y: Math.min(startPoint.y, endPoint.y),
    width: Math.abs(endPoint.x - startPoint.x),
    height: Math.abs(endPoint.y - startPoint.y),
  };
}

function isPointInsideBox(point: CanvasPoint, box: SelectionBox): boolean {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

export function useCanvasSelectionBox({
  diagram,
  svgRef,
  canvasSize,
  camera,
  selectedElementIds,
  setSelectedElements,
  clearSelection,
}: UseCanvasSelectionBoxProps) {
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const sessionRef = useRef<SelectionSession | null>(null);

  const getCanvasPoint = useCallback(
    (event: PointerEvent<SVGSVGElement>): CanvasPoint | null => {
      const svg = svgRef.current;

      if (!svg) {
        return null;
      }

      const rect = svg.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        return null;
      }

      return {
        x: ((event.clientX - rect.left) * canvasSize.width) / rect.width,
        y: ((event.clientY - rect.top) * canvasSize.height) / rect.height,
      };
    },
    [canvasSize, svgRef],
  );

  const toWorldPoint = useCallback(
    (point: CanvasPoint): CanvasPoint => ({
      x: (point.x - camera.x) / camera.zoom,
      y: (point.y - camera.y) / camera.zoom,
    }),
    [camera],
  );

  const startSelection = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      if (event.button !== 0) {
        return false;
      }

      const startPoint = getCanvasPoint(event);

      if (!startPoint) {
        return false;
      }

      sessionRef.current = {
        startPoint,
        additive: event.shiftKey || event.ctrlKey || event.metaKey,
        hasMoved: false,
      };

      event.currentTarget.setPointerCapture(event.pointerId);

      return true;
    },
    [getCanvasPoint],
  );

  const updateSelection = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const session = sessionRef.current;

      if (!session) {
        return;
      }

      const currentPoint = getCanvasPoint(event);

      if (!currentPoint) {
        return;
      }

      const box = getSelectionBox(session.startPoint, currentPoint);

      if (box.width < MOVEMENT_THRESHOLD && box.height < MOVEMENT_THRESHOLD) {
        return;
      }

      session.hasMoved = true;
      setSelectionBox(box);
    },
    [getCanvasPoint],
  );

  const finishSelection = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const session = sessionRef.current;

      if (!session) {
        return;
      }

      const endPoint = getCanvasPoint(event);

      sessionRef.current = null;
      setSelectionBox(null);

      if (!endPoint) {
        return;
      }

      if (!session.hasMoved) {
        if (!session.additive) {
          clearSelection();
        }

        return;
      }

      const worldStartPoint = toWorldPoint(session.startPoint);
      const worldEndPoint = toWorldPoint(endPoint);
      const worldSelectionBox = getSelectionBox(worldStartPoint, worldEndPoint);

      const selectedIds = getDiagramElements(diagram)
        .filter((element) => isPointInsideBox(element.position, worldSelectionBox))
        .map((element) => element.id);

      const nextSelectedIds = session.additive
        ? [...new Set([...selectedElementIds, ...selectedIds])]
        : selectedIds;

      setSelectedElements(nextSelectedIds);
    },
    [
      clearSelection,
      diagram,
      getCanvasPoint,
      selectedElementIds,
      setSelectedElements,
      toWorldPoint,
    ],
  );

  const cancelSelection = useCallback(() => {
    sessionRef.current = null;
    setSelectionBox(null);
  }, []);

  return {
    selectionBox,
    startSelection,
    updateSelection,
    finishSelection,
    cancelSelection,
  };
}
