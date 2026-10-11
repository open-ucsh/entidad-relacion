'use client';

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from 'react';

import type { LogicalBounds } from '../lib/logical-bounds';
import {
  INITIAL_LOGICAL_CAMERA,
  LOGICAL_ZOOM_STEP,
  type LogicalCamera,
  type LogicalViewportSize,
  zoomLogicalCameraAtPoint,
} from '../lib/logical-camera';
import { useLogicalFitToView } from './useLogicalFitToView';

interface UseLogicalCameraOptions {
  viewportRef: RefObject<HTMLDivElement | null>;
  viewportSize: LogicalViewportSize;
  bounds: LogicalBounds | null;
  tableCount: number;
}

export function useLogicalCamera({
  viewportRef,
  viewportSize,
  bounds,
  tableCount,
}: UseLogicalCameraOptions) {
  const [camera, setCamera] = useState<LogicalCamera>(INITIAL_LOGICAL_CAMERA);

  const didInitialFitRef = useRef(false);

  const fitToView = useLogicalFitToView({
    viewportRef,
    bounds,
    viewportSize,
    setCamera,
  });

  const zoomAtPoint = useCallback(
    (
      factor: number,
      point: {
        x: number;
        y: number;
      },
    ) => {
      setCamera((current) => {
        const next = zoomLogicalCameraAtPoint(current, current.zoom * factor, point);

        if (next.zoom === current.zoom) {
          return current;
        }

        return next;
      });
    },
    [],
  );

  const zoomIn = useCallback(() => {
    zoomAtPoint(LOGICAL_ZOOM_STEP, {
      x: viewportSize.width / 2,
      y: viewportSize.height / 2,
    });
  }, [viewportSize.height, viewportSize.width, zoomAtPoint]);

  const zoomOut = useCallback(() => {
    zoomAtPoint(1 / LOGICAL_ZOOM_STEP, {
      x: viewportSize.width / 2,
      y: viewportSize.height / 2,
    });
  }, [viewportSize.height, viewportSize.width, zoomAtPoint]);

  const resetView = useCallback(() => {
    setCamera(INITIAL_LOGICAL_CAMERA);
  }, []);

  const resetInitialFit = useCallback(() => {
    didInitialFitRef.current = false;
  }, []);

  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (event.deltaY === 0) {
        return;
      }

      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      const rect = viewport.getBoundingClientRect();

      zoomAtPoint(event.deltaY > 0 ? 1 / LOGICAL_ZOOM_STEP : LOGICAL_ZOOM_STEP, {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    },
    [viewportRef, zoomAtPoint],
  );

  useLayoutEffect(() => {
    if (tableCount === 0) {
      didInitialFitRef.current = false;

      const frame = requestAnimationFrame(() => {
        setCamera(INITIAL_LOGICAL_CAMERA);
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    if (
      !bounds ||
      viewportSize.width <= 1 ||
      viewportSize.height <= 1 ||
      didInitialFitRef.current
    ) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      fitToView();
      didInitialFitRef.current = true;
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [bounds, fitToView, tableCount, viewportSize.height, viewportSize.width]);

  return {
    camera,
    setCamera,
    fitToView,
    zoomIn,
    zoomOut,
    resetView,
    resetInitialFit,
    handleWheel,
  };
}
