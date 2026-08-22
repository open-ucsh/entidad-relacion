import { getDiagramContentBounds } from '@/components/editor/canvas/elements/diagram-content-bounds';
import { ELEMENT_GEOMETRY } from '@/components/editor/canvas/elements/element-shape-dimensions';
import { getConnectionEndpoints } from '@/components/editor/canvas/lib/connection-endpoints';
import { getElementAppearance } from '@/components/editor/element-appearance';
import type { Diagram } from '@/domain/diagram/models';
import {
  getElementColor,
  type DiagramAppearance,
  type ElementColor,
} from '@/state/diagram/diagram-appearance';

interface DocumentPreviewProps {
  diagram: Diagram;
  appearance: DiagramAppearance;
}

const PREVIEW_PADDING = 24;

function getViewBox(diagram: Diagram): string | null {
  const bounds = getDiagramContentBounds(diagram);

  if (!bounds) {
    return null;
  }

  return [
    bounds.x - PREVIEW_PADDING,
    bounds.y - PREVIEW_PADDING,
    bounds.width + PREVIEW_PADDING * 2,
    bounds.height + PREVIEW_PADDING * 2,
  ].join(' ');
}

function getPreviewAppearance(color: ElementColor) {
  const appearance = getElementAppearance(color);

  if (color !== 'neutral') {
    return appearance;
  }

  return {
    stroke: 'var(--color-text-muted)',
    fill: 'var(--color-background)',
  };
}

export function DocumentPreview({ diagram, appearance }: DocumentPreviewProps) {
  const viewBox = getViewBox(diagram);

  if (!viewBox) {
    return (
      <div className="flex size-full items-center justify-center bg-surface">
        <p className="text-xs text-text-muted">Diagrama vacío</p>
      </div>
    );
  }

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className="size-full bg-surface"
      aria-hidden="true"
    >
      <g opacity={0.85}>
        {diagram.connections.map((connection) => {
          const endpoints = getConnectionEndpoints(diagram, connection);

          if (!endpoints) {
            return null;
          }

          return (
            <line
              key={connection.id}
              x1={endpoints.from.x}
              y1={endpoints.from.y}
              x2={endpoints.to.x}
              y2={endpoints.to.y}
              stroke="var(--color-text-muted)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {diagram.entities.map((entity) => {
        const { x, y } = entity.position;
        const { width, height } = ELEMENT_GEOMETRY.entity;
        const elementAppearance = getPreviewAppearance(getElementColor(appearance, entity.id));
        const isWeak = entity.kind === 'weak';
        const isAssociative = entity.kind === 'associative';

        return (
          <g key={entity.id}>
            {isWeak && (
              <rect
                x={x - width / 2 + 4}
                y={y - height / 2 + 4}
                width={width}
                height={height}
                rx={4}
                fill="none"
                stroke={elementAppearance.stroke}
                strokeWidth={2}
              />
            )}

            <rect
              x={x - width / 2}
              y={y - height / 2}
              width={width}
              height={height}
              rx={isAssociative ? 2 : 5}
              fill={elementAppearance.fill}
              stroke={elementAppearance.stroke}
              strokeWidth={2}
            />

            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fill="var(--color-text)"
              fontSize={11}
              fontWeight={600}
            >
              {entity.name}
            </text>
          </g>
        );
      })}

      {diagram.relationships.map((relationship) => {
        const { x, y } = relationship.position;
        const { width, height } = ELEMENT_GEOMETRY.relationship;
        const elementAppearance = getPreviewAppearance(
          getElementColor(appearance, relationship.id),
        );
        const points = [
          `${x},${y - height / 2}`,
          `${x + width / 2},${y}`,
          `${x},${y + height / 2}`,
          `${x - width / 2},${y}`,
        ].join(' ');

        return (
          <g key={relationship.id}>
            <polygon
              points={points}
              fill={elementAppearance.fill}
              stroke={elementAppearance.stroke}
              strokeWidth={2}
              strokeLinejoin="round"
            />

            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fill="var(--color-text)"
              fontSize={10}
              fontWeight={600}
            >
              {relationship.name}
            </text>
          </g>
        );
      })}

      {diagram.attributes.map((attribute) => {
        const { x, y } = attribute.position;
        const { radiusX, radiusY } = ELEMENT_GEOMETRY.attribute;
        const elementAppearance = getPreviewAppearance(getElementColor(appearance, attribute.id));

        return (
          <g key={attribute.id}>
            {attribute.multivalued && (
              <ellipse
                cx={x}
                cy={y}
                rx={radiusX + 5}
                ry={radiusY + 5}
                fill="none"
                stroke={elementAppearance.stroke}
                strokeWidth={2}
              />
            )}

            <ellipse
              cx={x}
              cy={y}
              rx={radiusX}
              ry={radiusY}
              fill={elementAppearance.fill}
              stroke={elementAppearance.stroke}
              strokeWidth={2}
              strokeDasharray={attribute.derived ? '5 4' : undefined}
            />

            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fill="var(--color-text)"
              fontSize={10}
              fontWeight={600}
            >
              {attribute.name}
            </text>
          </g>
        );
      })}

      {diagram.isas.map((isa) => {
        const { x, y } = isa.position;
        const { width, height } = ELEMENT_GEOMETRY.isa;
        const elementAppearance = getPreviewAppearance(getElementColor(appearance, isa.id));
        const points = [
          `${x},${y - height / 2}`,
          `${x + width / 2},${y + height / 2}`,
          `${x - width / 2},${y + height / 2}`,
        ].join(' ');

        return (
          <g key={isa.id}>
            <polygon
              points={points}
              fill={elementAppearance.fill}
              stroke={elementAppearance.stroke}
              strokeWidth={2}
              strokeLinejoin="round"
            />

            <text
              x={x}
              y={y + 7}
              textAnchor="middle"
              fill="var(--color-text)"
              fontSize={10}
              fontWeight={700}
            >
              ISA
            </text>
          </g>
        );
      })}
    </svg>
  );
}
