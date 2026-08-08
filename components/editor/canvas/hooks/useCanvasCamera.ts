'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
  type WheelEvent,
} from 'react';

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasCamera {
  x: number;
  y: number;
  zoom: number;
}

interface ClientPoint {
  x: number;
  y: number;
}

const INITIAL_CAMERA: CanvasCamera = {
  x: 0,
  y: 0,
  zoom: 1,
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 1.1;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function useCanvasCamera(svgRef: RefObject<SVGSVGElement | null>) {
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: 1,
    height: 1,
  });

  const [camera, setCamera] = useState<CanvasCamera>(INITIAL_CAMERA);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<ClientPoint | null>(null);

  useEffect(() => {
    const svg = svgRef.current;

    if (!svg) {
      return;
    }

    function updateCanvasSize() {
      const currentSvg = svgRef.current;

      if (!currentSvg) {
        return;
      }

      const rect = currentSvg.getBoundingClientRect();

      setCanvasSize({
        width: Math.max(rect.width, 1),
        height: Math.max(rect.height, 1),
      });
    }

    updateCanvasSize();

    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(svg);

    return () => {
      observer.disconnect();
    };
  }, [svgRef]);

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;

      if (!svg) {
        return null;
      }

      const rect = svg.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        return null;
      }

      return {
        x: ((clientX - rect.left) * canvasSize.width) / rect.width,
        y: ((clientY - rect.top) * canvasSize.height) / rect.height,
      };
    },
    [canvasSize, svgRef],
  );

  const zoomAtPoint = useCallback((factor: number, point: ClientPoint) => {
    setCamera((current) => {
      const zoom = clamp(current.zoom * factor, MIN_ZOOM, MAX_ZOOM);

      return {
        x: point.x - ((point.x - current.x) / current.zoom) * zoom,
        y: point.y - ((point.y - current.y) / current.zoom) * zoom,
        zoom,
      };
    });
  }, []);

  const handleWheel = useCallback(
    (event: WheelEvent<SVGSVGElement>) => {
      event.preventDefault();

      const point = getCanvasPoint(event.clientX, event.clientY);

      if (!point) {
        return;
      }

      zoomAtPoint(event.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP, point);
    },
    [getCanvasPoint, zoomAtPoint],
  );

  const zoomIn = useCallback(() => {
    zoomAtPoint(ZOOM_STEP, {
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
    });
  }, [canvasSize, zoomAtPoint]);

  const zoomOut = useCallback(() => {
    zoomAtPoint(1 / ZOOM_STEP, {
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
    });
  }, [canvasSize, zoomAtPoint]);

  const resetView = useCallback(() => {
    setCamera(INITIAL_CAMERA);
  }, []);

  const startPan = useCallback((event: PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const pan = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const panStart = panStartRef.current;

      if (!panStart) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const dx = ((event.clientX - panStart.x) * canvasSize.width) / rect.width;
      const dy = ((event.clientY - panStart.y) * canvasSize.height) / rect.height;

      setCamera((current) => ({
        ...current,
        x: current.x + dx,
        y: current.y + dy,
      }));

      panStartRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    },
    [canvasSize],
  );

  const stopPan = useCallback(() => {
    panStartRef.current = null;
    setIsPanning(false);
  }, []);

  return {
    canvasSize,
    camera,
    isPanning,
    handleWheel,
    startPan,
    pan,
    stopPan,
    zoomIn,
    zoomOut,
    resetView,
    zoomPercentage: Math.round(camera.zoom * 100),
    canZoomIn: camera.zoom < MAX_ZOOM,
    canZoomOut: camera.zoom > MIN_ZOOM,
  };
}
