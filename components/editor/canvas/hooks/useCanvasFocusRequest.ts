import { useEffect, useRef } from 'react';

import type { Diagram, Point } from '@/domain/diagram/models';

import { findDiagramElement } from '@/domain/diagram/queries/elements';

import type { CanvasFocusRequest } from '@/state/diagram/diagram-store.types';

import { getConnectionEndpoints } from '../lib/connection-endpoints';

interface UseCanvasFocusRequestOptions {
  focusRequest: CanvasFocusRequest | null;
  diagram: Diagram;
  centerOnPoint: (point: Point) => void;
}

export function useCanvasFocusRequest({
  focusRequest,
  diagram,
  centerOnPoint,
}: UseCanvasFocusRequestOptions) {
  const completedRequestIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!focusRequest || completedRequestIdRef.current === focusRequest.requestId) {
      return;
    }

    completedRequestIdRef.current = focusRequest.requestId;

    const element = findDiagramElement(diagram, focusRequest.targetId);

    if (element) {
      centerOnPoint(element.position);
      return;
    }

    const connection = diagram.connections.find((item) => item.id === focusRequest.targetId);

    if (!connection) {
      return;
    }

    const endpoints = getConnectionEndpoints(diagram, connection);

    if (!endpoints) {
      return;
    }

    centerOnPoint({
      x: (endpoints.from.x + endpoints.to.x) / 2,
      y: (endpoints.from.y + endpoints.to.y) / 2,
    });
  }, [centerOnPoint, diagram, focusRequest]);
}
