import type { DiagramElement, Point } from '@/domain/diagram/models';

export const ELEMENT_GEOMETRY = {
  entity: {
    width: 120,
    height: 56,
  },
  relationship: {
    width: 120,
    height: 60,
  },
  attribute: {
    radiusX: 55,
    radiusY: 28,
    outerOutlineOffset: 5,
  },
  isa: {
    width: 64,
    height: 52,
  },
} as const;

export interface ElementVisualBounds {
  center: Point;
  halfWidth: number;
  halfHeight: number;
}

export function getElementVisualBounds(element: DiagramElement): ElementVisualBounds {
  switch (element.type) {
    case 'entity':
      return {
        center: element.position,
        halfWidth: ELEMENT_GEOMETRY.entity.width / 2,
        halfHeight: ELEMENT_GEOMETRY.entity.height / 2,
      };

    case 'relationship':
      return {
        center: element.position,
        halfWidth: ELEMENT_GEOMETRY.relationship.width / 2,
        halfHeight: ELEMENT_GEOMETRY.relationship.height / 2,
      };

    case 'attribute':
      return {
        center: element.position,
        halfWidth: ELEMENT_GEOMETRY.attribute.radiusX,
        halfHeight:
          ELEMENT_GEOMETRY.attribute.radiusY + ELEMENT_GEOMETRY.attribute.outerOutlineOffset,
      };

    case 'isa':
      return {
        center: element.position,
        halfWidth: ELEMENT_GEOMETRY.isa.width / 2,
        halfHeight: ELEMENT_GEOMETRY.isa.height / 2,
      };
  }
}
