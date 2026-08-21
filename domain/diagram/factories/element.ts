import { createId } from '@/domain/diagram/lib/id';

import type {
  Attribute,
  DiagramElement,
  Entity,
  Isa,
  Point,
  Relationship,
} from '@/domain/diagram/models';

export type CreatableDiagramElementType = DiagramElement['type'];

function createEntity(position: Point): Entity {
  return {
    id: createId('entity'),
    type: 'entity',
    name: 'Nueva Entidad',
    position,
    color: 'neutral',
    kind: 'regular',
  };
}

function createRelationship(position: Point): Relationship {
  return {
    id: createId('relationship'),
    type: 'relationship',
    name: 'Nueva Relación',
    position,
    color: 'neutral',
    kind: 'regular',
  };
}

export function createAttribute(position: Point): Attribute {
  return {
    id: createId('attribute'),
    type: 'attribute',
    name: 'Nuevo Atributo',
    position,
    color: 'neutral',
    keyType: 'normal',
    unique: false,
    multivalued: false,
    optional: false,
    composite: false,
    derived: false,
  };
}

function createIsa(position: Point): Isa {
  return {
    id: createId('isa'),
    type: 'isa',
    name: 'ISA',
    position,
    color: 'neutral',
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
    case 'isa':
      return createIsa(position);
  }
}
