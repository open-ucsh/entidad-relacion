'use client';

import { type PointerEvent, useCallback, useRef, useState } from 'react';

import { getElementBoundaryPoint } from '../elements/element-shape-geometry';
import type { Diagram, Point } from '@/domain/diagram/models';
import { findDiagramElement } from '@/domain/diagram/queries/elements';
import { canConnectElementsById } from '@/domain/diagram/validation/connections';

import type { ConnectionPreview } from '../CanvasConnectionPreview';
import { getElementIdAtPoint } from '../lib/canvas-elements';

interface UseCanvasConnectionProps {
  diagram: Diagram;
  getWorldPoint: (event: globalThis.PointerEvent) => Point | null;
  beginConnection: (sourceId: string) => void;
  cancelConnection: () => void;
  connectElements: (sourceId: string, targetId: string) => void;
}

export function useCanvasConnection({
  diagram,
  getWorldPoint,
  beginConnection,
  cancelConnection,
  connectElements,
}: UseCanvasConnectionProps) {
  const sourceIdRef = useRef<string | null>(null);

  const [preview, setPreview] = useState<ConnectionPreview | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const createPreview = useCallback(
    (sourceId: string, pointer: Point, targetId?: string | null): ConnectionPreview | null => {
      const sourceElement = findDiagramElement(diagram, sourceId);

      if (!sourceElement) {
        return null;
      }

      const targetElement = targetId ? findDiagramElement(diagram, targetId) : undefined;

      if (
        targetElement &&
        targetElement.id !== sourceElement.id &&
        canConnectElementsById(diagram, sourceId, targetElement.id)
      ) {
        return {
          from: getElementBoundaryPoint(sourceElement, targetElement.position),
          to: getElementBoundaryPoint(targetElement, sourceElement.position),
        };
      }

      return {
        from: getElementBoundaryPoint(sourceElement, pointer),
        to: pointer,
      };
    },
    [diagram],
  );

  const resetConnection = useCallback(() => {
    sourceIdRef.current = null;
    setPreview(null);
    setDropTargetId(null);
    cancelConnection();
  }, [cancelConnection]);

  const startConnection = useCallback(
    (event: PointerEvent<SVGGElement>, sourceId: string) => {
      event.preventDefault();
      event.stopPropagation();

      const pointer = getWorldPoint(event.nativeEvent);

      if (!pointer) {
        return;
      }

      const nextPreview = createPreview(sourceId, pointer);

      if (!nextPreview) {
        return;
      }

      sourceIdRef.current = sourceId;
      setPreview(nextPreview);
      beginConnection(sourceId);

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [beginConnection, createPreview, getWorldPoint],
  );

  const moveConnection = useCallback(
    (event: PointerEvent<SVGSVGElement>): boolean => {
      const sourceId = sourceIdRef.current;

      if (!sourceId) {
        return false;
      }

      const pointer = getWorldPoint(event.nativeEvent);

      if (!pointer) {
        return true;
      }

      const hoveredElementId = getElementIdAtPoint(event.clientX, event.clientY);

      const validTargetId =
        hoveredElementId &&
        hoveredElementId !== sourceId &&
        canConnectElementsById(diagram, sourceId, hoveredElementId)
          ? hoveredElementId
          : null;

      setDropTargetId(validTargetId);
      setPreview(createPreview(sourceId, pointer, validTargetId));

      return true;
    },
    [createPreview, diagram, getWorldPoint],
  );

  const finishConnection = useCallback(
    (event: PointerEvent<SVGSVGElement>): boolean => {
      const sourceId = sourceIdRef.current;

      if (!sourceId) {
        return false;
      }

      const targetId = getElementIdAtPoint(event.clientX, event.clientY);

      if (
        targetId &&
        targetId !== sourceId &&
        canConnectElementsById(diagram, sourceId, targetId)
      ) {
        connectElements(sourceId, targetId);
      }

      resetConnection();

      return true;
    },
    [connectElements, diagram, resetConnection],
  );

  return {
    connectionPreview: preview,
    connectionDropTargetId: dropTargetId,
    startConnection,
    moveConnection,
    finishConnection,
    cancelConnection: resetConnection,
  };
}
