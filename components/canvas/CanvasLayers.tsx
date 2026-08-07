export function CanvasLayers() {
  return (
    <>
      {/* Grid */}
      <rect width="100%" height="100%" fill="url(#canvas-grid)" />

      {/* Connections */}
      <g id="connections-layer" />

      {/* Elements */}
      <g id="elements-layer" />

      {/* Selection */}
      <g id="selection-layer" />

      {/* Overlay */}
      <g id="overlay-layer" />
    </>
  );
}
