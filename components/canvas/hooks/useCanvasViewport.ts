'use client';

import {
  useCallback,
  useEffect,
  useState,
  type PointerEvent,
  type RefObject,
  type WheelEvent,
} from 'react';

export interface CanvasSize {
  width: number;
  height: number;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

const INITIAL_CAMERA: Camera = {
  x: 0,
  y: 0,
  zoom: 1,
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 1.1;

export function useCanvasViewport(svgRef: RefObject<SVGSVGElement | null>) {
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: 1,
    height: 1,
  });

  const [camera, setCamera] = useState<Camera>(INITIAL_CAMERA);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

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

  const zoomAtPoint = useCallback((factor: number, pointX: number, pointY: number) => {
    setCamera((current) => {
      const zoom = Math.min(Math.max(current.zoom * factor, MIN_ZOOM), MAX_ZOOM);

      return {
        x: pointX - ((pointX - current.x) / current.zoom) * zoom,
        y: pointY - ((pointY - current.y) / current.zoom) * zoom,
        zoom,
      };
    });
  }, []);

  function handleWheel(event: WheelEvent<SVGSVGElement>) {
    event.preventDefault();

    const point = getCanvasPoint(event.clientX, event.clientY);

    if (!point) {
      return;
    }

    zoomAtPoint(event.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP, point.x, point.y);
  }

  const zoomIn = useCallback(() => {
    zoomAtPoint(ZOOM_STEP, canvasSize.width / 2, canvasSize.height / 2);
  }, [canvasSize, zoomAtPoint]);

  const zoomOut = useCallback(() => {
    zoomAtPoint(1 / ZOOM_STEP, canvasSize.width / 2, canvasSize.height / 2);
  }, [canvasSize, zoomAtPoint]);

  const resetView = useCallback(() => {
    setCamera(INITIAL_CAMERA);
  }, []);

  function startPan(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    setPanning(true);
    setPanStart({
      x: event.clientX,
      y: event.clientY,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pan(event: PointerEvent<SVGSVGElement>) {
    if (!panning || !panStart) {
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

    setPanStart({
      x: event.clientX,
      y: event.clientY,
    });
  }

  function stopPan() {
    setPanning(false);
    setPanStart(null);
  }

  return {
    canvasSize,
    camera,
    panning,
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
