import type { SelectionBox as SelectionBoxData } from './hooks/useCanvasSelectionBox';

interface SelectionBoxProps {
  box: SelectionBoxData;
}

export function SelectionBox({ box }: SelectionBoxProps) {
  return (
    <g pointerEvents="none" aria-hidden="true">
      <rect
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        rx={2}
        fill="var(--color-brand-primary)"
        fillOpacity={0.07}
        stroke="var(--color-brand-primary)"
        strokeOpacity={0.9}
        strokeWidth={1.25}
        strokeDasharray="6 4"
        vectorEffect="non-scaling-stroke"
      />

      <rect
        x={box.x + 1}
        y={box.y + 1}
        width={Math.max(0, box.width - 2)}
        height={Math.max(0, box.height - 2)}
        rx={1}
        fill="none"
        stroke="white"
        fillOpacity={0.045}
        strokeOpacity={0.8}
        strokeWidth={1}
        strokeDasharray="6 4"
        strokeDashoffset={1}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}
