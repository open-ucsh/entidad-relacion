'use client';

import { useCallback, useRef, useState, type PointerEvent } from 'react';

import type { Diagram, Point } from '@/domain/diagram/models';
import { getElementPosition } from '@/domain/diagram/queries/elements';
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

      const from = getElementPosition(diagram, sourceId);
      const to = getWorldPoint(event.nativeEvent);

      if (!from || !to) {
        return;
      }

      sourceIdRef.current = sourceId;
      setPreview({ from, to });
      beginConnection(sourceId);

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [beginConnection, diagram, getWorldPoint],
  );

  const moveConnection = useCallback(
    (event: PointerEvent<SVGSVGElement>): boolean => {
      const sourceId = sourceIdRef.current;

      if (!sourceId) {
        return false;
      }

      const from = getElementPosition(diagram, sourceId);
      const to = getWorldPoint(event.nativeEvent);
      const targetId = getElementIdAtPoint(event.clientX, event.clientY);

      if (from && to) {
        setPreview({ from, to });
      }

      if (targetId && canConnectElementsById(diagram, sourceId, targetId)) {
        setDropTargetId(targetId);
      } else {
        setDropTargetId(null);
      }

      return true;
    },
    [diagram, getWorldPoint],
  );

  const finishConnection = useCallback(
    (event: PointerEvent<SVGSVGElement>): boolean => {
      const sourceId = sourceIdRef.current;

      if (!sourceId) {
        return false;
      }

      const targetId = getElementIdAtPoint(event.clientX, event.clientY);

      if (targetId && targetId !== sourceId) {
        connectElements(sourceId, targetId);
      }

      resetConnection();

      return true;
    },
    [connectElements, resetConnection],
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
