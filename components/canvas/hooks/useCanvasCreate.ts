import type { Attribute, Entity, Isa, Relationship, Tool } from '@/domain/models';

import { createId } from '@/lib/id';
import { useDiagramStore } from '@/state/diagram-store';

type CanvasElement = Entity | Relationship | Attribute | Isa;

export function useCanvasCreate() {
  const diagram = useDiagramStore((state) => state.diagram);

  const addEntity = useDiagramStore((state) => state.addEntity);
  const addRelationship = useDiagramStore((state) => state.addRelationship);
  const addAttribute = useDiagramStore((state) => state.addAttribute);
  const addIsa = useDiagramStore((state) => state.addIsa);

  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);

  function create(tool: Tool) {
    if (tool === 'select' || tool === 'connect') {
      return;
    }

    const totalElements =
      diagram.entities.length +
      diagram.relationships.length +
      diagram.attributes.length +
      diagram.isas.length;

    const position = {
      x: 180 + (totalElements % 5) * 160,
      y: 120 + Math.floor(totalElements / 5) * 120,
    };

    let element: CanvasElement | null = null;

    switch (tool) {
      case 'entity':
        element = {
          type: 'entity',
          id: createId('entity'),
          name: 'Nueva Entidad',
          position,
          kind: 'regular',
        };
        break;

      case 'relationship':
        element = {
          type: 'relationship',
          id: createId('relationship'),
          name: 'Nueva Relación',
          position,
          kind: 'regular',
          minimum: 'unspecified',
          maximum: 'unspecified',
          cardinality: 'unspecified',
          participation: 'optional',
        };
        break;

      case 'attribute':
        element = {
          type: 'attribute',
          id: createId('attribute'),
          name: 'Nuevo Atributo',
          position,
          keyType: 'normal',
          unique: false,
          multivalued: false,
          optional: false,
          composite: false,
          derived: false,
        };
        break;

      case 'isa':
        element = {
          type: 'isa',
          id: createId('isa'),
          name: 'ISA',
          position,
          superEntityId: null,
          subEntityIds: [],
          disjointness: 'disjoint',
          completeness: 'partial',
        };
        break;

      default:
        return;
    }

    switch (element.type) {
      case 'entity':
        addEntity(element);
        break;

      case 'relationship':
        addRelationship(element);
        break;

      case 'attribute':
        addAttribute(element);
        break;

      case 'isa':
        addIsa(element);
        break;
    }

    setSelectedElement(element.id);
  }

  return {
    create,
  };
}
