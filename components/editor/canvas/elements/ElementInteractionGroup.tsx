import type { MouseEvent, PointerEvent, PropsWithChildren } from 'react';

interface ElementInteractionGroupProps extends PropsWithChildren {
  elementId: string;
  onClick: (event: MouseEvent<SVGGElement>) => void;
  onDoubleClick: () => void;
  onPointerDown?: ((event: PointerEvent<SVGGElement>) => void) | undefined;
}

export function ElementInteractionGroup({
  children,
  elementId,
  onClick,
  onDoubleClick,
  onPointerDown,
}: ElementInteractionGroupProps) {
  return (
    <g
      data-diagram-element-id={elementId}
      onPointerDown={onPointerDown}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onDoubleClick();
      }}
      className="cursor-pointer"
    >
      {children}
    </g>
  );
}
