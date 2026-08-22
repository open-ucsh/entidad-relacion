import type { MouseEvent, PointerEvent } from 'react';

import type { ElementColor } from '@/state/diagram/diagram-appearance';

import { getElementAppearance } from '../../element-appearance';
import { ELEMENT_GEOMETRY } from './element-shape-dimensions';

import type { Isa } from '@/domain/diagram/models';

import { ConnectionHandle, CONNECTION_HANDLE_OFFSET } from './ConnectionHandle';
import { ElementInteractionGroup } from './ElementInteractionGroup';

const WIDTH = ELEMENT_GEOMETRY.isa.width;
const HEIGHT = ELEMENT_GEOMETRY.isa.height;

interface IsaShapeProps {
  isa: Isa;

  color: ElementColor;
  selected: boolean;
  showConnectionHandle: boolean;
  showConnectionTargets: boolean;
  isConnectionTarget: boolean;
  isConnectionDropTarget: boolean;
  isConnectionTargetInvalid: boolean;
  onClick: (event: MouseEvent<SVGGElement>) => void;
  onPointerDown?: ((event: PointerEvent<SVGGElement>) => void) | undefined;
  onConnectionPointerDown: (event: PointerEvent<SVGGElement>) => void;
}

export function IsaShape({
  isa,
  color,
  selected,
  showConnectionHandle,
  showConnectionTargets,
  isConnectionTarget,
  isConnectionDropTarget,
  isConnectionTargetInvalid,
  onClick,
  onPointerDown,
  onConnectionPointerDown,
}: IsaShapeProps) {
  const { x, y } = isa.position;
  const appearance = getElementAppearance(color);

  const points = [
    `${x},${y - HEIGHT / 2}`,
    `${x + WIDTH / 2},${y + HEIGHT / 2}`,
    `${x - WIDTH / 2},${y + HEIGHT / 2}`,
  ].join(' ');

  const isInvalidTarget = showConnectionTargets && isConnectionTargetInvalid && !selected;

  const isValidTarget =
    showConnectionTargets && isConnectionTarget && !selected && !isConnectionDropTarget;

  const stroke = isConnectionDropTarget
    ? 'var(--color-brand-primary-hover)'
    : isValidTarget
      ? 'var(--color-brand-primary)'
      : appearance.stroke;

  const strokeWidth = isConnectionDropTarget ? 3 : selected ? 2.5 : isValidTarget ? 2 : 1.5;

  const fill = isConnectionDropTarget ? 'var(--color-brand-primary)' : appearance.fill;

  return (
    <ElementInteractionGroup
      elementId={isa.id}
      onClick={onClick}
      onDoubleClick={() => {}}
      {...(onPointerDown ? { onPointerDown } : {})}
    >
      <g opacity={isInvalidTarget ? 0.35 : 1}>
        <polygon
          points={points}
          fill={fill}
          fillOpacity={isConnectionDropTarget ? 0.12 : 1}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          className="transition-colors duration-150"
          data-export-reset-selection
        />

        <text
          x={x}
          y={y + 8}
          textAnchor="middle"
          className="pointer-events-none fill-text text-xs font-bold"
        >
          ISA
        </text>
      </g>

      {selected && showConnectionHandle && (
        <g data-export-exclude>
          <ConnectionHandle
            x={x + WIDTH / 2 + CONNECTION_HANDLE_OFFSET}
            y={y}
            onPointerDown={onConnectionPointerDown}
          />
        </g>
      )}
    </ElementInteractionGroup>
  );
}
