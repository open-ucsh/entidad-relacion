import type { Point } from '@/domain/diagram/models';

export interface ConnectionPreview {
  from: Point;
  to: Point;
}

interface CanvasConnectionPreviewProps {
  preview: ConnectionPreview | null;
}

export function CanvasConnectionPreview({ preview }: CanvasConnectionPreviewProps) {
  if (!preview) {
    return null;
  }

  return (
    <g pointerEvents="none" aria-hidden="true" data-export-exclude>
      <line
        x1={preview.from.x}
        y1={preview.from.y}
        x2={preview.to.x}
        y2={preview.to.y}
        stroke="var(--color-brand-primary)"
        strokeWidth={1.75}
        strokeDasharray="5 5"
        strokeLinecap="round"
        opacity={0.75}
      />
    </g>
  );
}
