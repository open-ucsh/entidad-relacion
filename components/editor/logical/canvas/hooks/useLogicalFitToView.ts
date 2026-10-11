'use client';

import { useCallback, type RefObject } from 'react';

import type { LogicalBounds } from '../lib/logical-bounds';
import {
  clampLogicalZoom,
  INITIAL_LOGICAL_CAMERA,
  type LogicalCamera,
  type LogicalViewportSize,
} from '../lib/logical-camera';

interface UseLogicalFitToViewOptions {
  viewportRef: RefObject<HTMLDivElement | null>;
  bounds: LogicalBounds | null;
  viewportSize: LogicalViewportSize;
  setCamera: (camera: LogicalCamera | ((current: LogicalCamera) => LogicalCamera)) => void;
}

export function useLogicalFitToView({
  viewportRef,
  bounds,
  viewportSize,
  setCamera,
}: UseLogicalFitToViewOptions) {
  return useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport || viewportSize.width <= 1 || viewportSize.height <= 1) {
      return;
    }

    const cards = viewport.querySelectorAll<HTMLElement>('[data-logical-table-id]');

    let contentBounds = bounds;

    if (cards.length > 0) {
      let left = Number.POSITIVE_INFINITY;
      let top = Number.POSITIVE_INFINITY;
      let right = Number.NEGATIVE_INFINITY;
      let bottom = Number.NEGATIVE_INFINITY;

      for (const card of cards) {
        left = Math.min(left, card.offsetLeft);
        top = Math.min(top, card.offsetTop);
        right = Math.max(right, card.offsetLeft + card.offsetWidth);
        bottom = Math.max(bottom, card.offsetTop + card.offsetHeight);
      }

      contentBounds = {
        x: left,
        y: top,
        width: Math.max(right - left, 1),
        height: Math.max(bottom - top, 1),
      };
    }

    if (!contentBounds) {
      setCamera(INITIAL_LOGICAL_CAMERA);
      return;
    }

    let areaLeft = 32;
    const areaTop = 88;
    const areaRight = viewportSize.width - 32;
    let areaBottom = viewportSize.height - 72;

    const inspector = viewport.parentElement?.querySelector<HTMLElement>('[data-editor-inspector]');

    if (inspector && window.getComputedStyle(inspector).visibility === 'visible') {
      const viewportRect = viewport.getBoundingClientRect();
      const panelRect = inspector.getBoundingClientRect();

      if (panelRect.width >= viewportRect.width * 0.8) {
        areaBottom = Math.min(areaBottom, panelRect.top - viewportRect.top - 24);
      } else {
        areaLeft = Math.max(areaLeft, panelRect.right - viewportRect.left + 32);
      }
    }

    const availableWidth = Math.max(areaRight - areaLeft, 1);
    const availableHeight = Math.max(areaBottom - areaTop, 1);

    const zoom = clampLogicalZoom(
      Math.min(availableWidth / contentBounds.width, availableHeight / contentBounds.height, 1),
    );

    const centerX = contentBounds.x + contentBounds.width / 2;
    const centerY = contentBounds.y + contentBounds.height / 2;

    setCamera({
      zoom,
      x: areaLeft + availableWidth / 2 - centerX * zoom,
      y: areaTop + availableHeight / 2 - centerY * zoom,
    });
  }, [bounds, viewportRef, viewportSize.height, viewportSize.width, setCamera]);
}
