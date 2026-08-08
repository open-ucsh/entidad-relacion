import type { Point } from '@/domain/models';

interface ConnectionShapeProps {
  from: Point;
  to: Point;
  selected: boolean;
  onClick: () => void;
}

export function ConnectionShape({ from, to, selected, onClick }: ConnectionShapeProps) {
  const stroke = selected ? 'var(--color-brand-primary)' : 'var(--color-border)';
  const strokeWidth = selected ? 3 : 1.5;

  return (
    <g
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="cursor-pointer"
    >
      {/* línea invisible más ancha, facilita hacer click sobre la conexión */}
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth={14} />
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={stroke} strokeWidth={strokeWidth} />
    </g>
  );
}
