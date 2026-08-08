import type { Diagram, Point } from '@/domain/diagram/models';

interface DiagramBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ENTITY_HALF_WIDTH = 60;
const ENTITY_HALF_HEIGHT = 28;

const RELATIONSHIP_HALF_WIDTH = 60;
const RELATIONSHIP_HALF_HEIGHT = 30;

const ATTRIBUTE_HALF_WIDTH = 60;
const ATTRIBUTE_HALF_HEIGHT = 33;

const EXPORT_PADDING = 80;
const MIN_EXPORT_WIDTH = 640;
const MIN_EXPORT_HEIGHT = 420;

function createBounds(position: Point, halfWidth: number, halfHeight: number): DiagramBounds {
  return {
    x: position.x - halfWidth,
    y: position.y - halfHeight,
    width: halfWidth * 2,
    height: halfHeight * 2,
  };
}

function mergeBounds(current: DiagramBounds, next: DiagramBounds): DiagramBounds {
  const left = Math.min(current.x, next.x);
  const top = Math.min(current.y, next.y);
  const right = Math.max(current.x + current.width, next.x + next.width);
  const bottom = Math.max(current.y + current.height, next.y + next.height);

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

function addPadding(bounds: DiagramBounds): DiagramBounds {
  const width = Math.max(bounds.width + EXPORT_PADDING * 2, MIN_EXPORT_WIDTH);
  const height = Math.max(bounds.height + EXPORT_PADDING * 2, MIN_EXPORT_HEIGHT);

  return {
    x: bounds.x + bounds.width / 2 - width / 2,
    y: bounds.y + bounds.height / 2 - height / 2,
    width,
    height,
  };
}

export function getDiagramExportBounds(diagram: Diagram): DiagramBounds | null {
  const bounds = [
    ...diagram.entities.map((entity) =>
      createBounds(entity.position, ENTITY_HALF_WIDTH, ENTITY_HALF_HEIGHT),
    ),
    ...diagram.relationships.map((relationship) =>
      createBounds(relationship.position, RELATIONSHIP_HALF_WIDTH, RELATIONSHIP_HALF_HEIGHT),
    ),
    ...diagram.attributes.map((attribute) =>
      createBounds(attribute.position, ATTRIBUTE_HALF_WIDTH, ATTRIBUTE_HALF_HEIGHT),
    ),
  ];

  const diagramBounds = bounds.reduce<DiagramBounds | null>(
    (current, next) => (current ? mergeBounds(current, next) : next),
    null,
  );

  return diagramBounds ? addPadding(diagramBounds) : null;
}
