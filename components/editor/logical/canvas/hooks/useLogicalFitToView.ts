'use client';

import { useCallback } from 'react';

import type { LogicalBounds } from '../lib/logical-bounds';
import {
  clampLogicalZoom,
  INITIAL_LOGICAL_CAMERA,
  type LogicalCamera,
  type LogicalViewportSize,
} from '../lib/logical-camera';

const FIT_PADDING = 72;

interface UseLogicalFitToViewOptions {
  bounds: LogicalBounds | null;
  viewportSize: LogicalViewportSize;
  setCamera: (camera: LogicalCamera | ((current: LogicalCamera) => LogicalCamera)) => void;
}

export function useLogicalFitToView({
  bounds,
  viewportSize,
  setCamera,
}: UseLogicalFitToViewOptions) {
  return useCallback(() => {
    if (!bounds) {
      setCamera(INITIAL_LOGICAL_CAMERA);
      return;
    }

    const availableWidth = Math.max(viewportSize.width - FIT_PADDING * 2, 1);

    const availableHeight = Math.max(viewportSize.height - FIT_PADDING * 2, 1);

    const zoom = clampLogicalZoom(
      Math.min(availableWidth / bounds.width, availableHeight / bounds.height),
    );

    const centerX = bounds.x + bounds.width / 2;

    const centerY = bounds.y + bounds.height / 2;

    setCamera({
      zoom,
      x: viewportSize.width / 2 - centerX * zoom,
      y: viewportSize.height / 2 - centerY * zoom,
    });
  }, [bounds, setCamera, viewportSize.height, viewportSize.width]);
}
