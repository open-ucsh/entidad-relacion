export interface LogicalCamera {
  x: number;
  y: number;
  zoom: number;
}

export interface LogicalViewportSize {
  width: number;
  height: number;
}

export const INITIAL_LOGICAL_CAMERA: LogicalCamera = {
  x: 0,
  y: 0,
  zoom: 1,
};

export const MIN_LOGICAL_ZOOM = 0.25;
export const MAX_LOGICAL_ZOOM = 3;
export const LOGICAL_ZOOM_STEP = 1.1;

export function clampLogicalZoom(zoom: number): number {
  return Math.min(MAX_LOGICAL_ZOOM, Math.max(MIN_LOGICAL_ZOOM, zoom));
}

export function zoomLogicalCameraAtPoint(
  camera: LogicalCamera,
  nextZoom: number,
  point: {
    x: number;
    y: number;
  },
): LogicalCamera {
  const zoom = clampLogicalZoom(nextZoom);

  const worldX = (point.x - camera.x) / camera.zoom;

  const worldY = (point.y - camera.y) / camera.zoom;

  return {
    zoom,
    x: point.x - worldX * zoom,
    y: point.y - worldY * zoom,
  };
}
