export function CanvasGrid() {
  return (
    <>
      <defs>
        <pattern id="canvas-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" className="stroke-border" strokeWidth={1} />
        </pattern>
      </defs>

      <rect x="0" y="0" width="100%" height="100%" className="fill-background" />
      <rect x="0" y="0" width="100%" height="100%" fill="url(#canvas-grid)" opacity={0.5} />
    </>
  );
}
