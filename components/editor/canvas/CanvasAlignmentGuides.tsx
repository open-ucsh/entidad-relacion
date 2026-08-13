export interface AlignmentGuides {
  x: number | null;
  y: number | null;
}

interface CanvasAlignmentGuidesProps {
  guides: AlignmentGuides | null;
}

export function CanvasAlignmentGuides({ guides }: CanvasAlignmentGuidesProps) {
  if (!guides) {
    return null;
  }

  return (
    <g pointerEvents="none" aria-hidden="true">
      {guides.x !== null && (
        <line
          x1={guides.x}
          y1={-10000}
          x2={guides.x}
          y2={10000}
          stroke="var(--color-brand-primary)"
          strokeWidth={1}
          strokeOpacity={0.65}
          strokeDasharray="5 5"
          vectorEffect="non-scaling-stroke"
        />
      )}

      {guides.y !== null && (
        <line
          x1={-10000}
          y1={guides.y}
          x2={10000}
          y2={guides.y}
          stroke="var(--color-brand-primary)"
          strokeWidth={1}
          strokeOpacity={0.65}
          strokeDasharray="5 5"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </g>
  );
}
