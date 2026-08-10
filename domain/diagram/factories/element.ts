import { createId } from '@/domain/diagram/lib/id';
import type {
  Attribute,
  DiagramElement,
  Entity,
  Point,
  Relationship,
} from '@/domain/diagram/models';

export type CreatableDiagramElementType = DiagramElement['type'];

export function createEntity(position: Point): Entity {
  return {
    id: createId('entity'),
    type: 'entity',
    name: 'Nueva Entidad',
    position,
    kind: 'regular',
  };
}

export function createRelationship(position: Point): Relationship {
  return {
    id: createId('relationship'),
    type: 'relationship',
    name: 'Nueva Relación',
    position,
    kind: 'regular',
  };
}

export function createAttribute(position: Point): Attribute {
  return {
    id: createId('attribute'),
    type: 'attribute',
    name: 'Nuevo Atributo',
    position,
    keyType: 'normal',
    unique: false,
    multivalued: false,
    optional: false,
    composite: false,
    derived: false,
  };
}

export function createDiagramElement(
  type: CreatableDiagramElementType,
  position: Point,
): DiagramElement {
  switch (type) {
    case 'entity':
      return createEntity(position);

    case 'relationship':
      return createRelationship(position);

    case 'attribute':
      return createAttribute(position);
  }
}
