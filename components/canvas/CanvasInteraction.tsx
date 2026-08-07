'use client';
import type { MouseEvent, ReactNode } from 'react';
import type { Attribute, Entity, Isa, Relationship, Tool } from '@/domain/models';
import { createId } from '@/lib/id';
import { useDiagramStore } from '@/state/diagram-store';

interface CanvasInteractionProps {
  children: ReactNode;
}

type CanvasElement = Entity | Relationship | Attribute | Isa;

function createElement(tool: Tool, x: number, y: number): CanvasElement | null {
  switch (tool) {
    case 'entity':
      return {
        type: 'entity',
        id: createId('entity'),
        name: 'Nueva Entidad',
        position: { x, y },
        kind: 'regular',
      };
    case 'relationship':
      return {
        type: 'relationship',
        id: createId('relationship'),
        name: 'Nueva Relación',
        position: { x, y },
        kind: 'regular',
        minimum: 'unspecified',
        maximum: 'unspecified',
        cardinality: 'unspecified',
        participation: 'optional',
      };
    case 'attribute':
      return {
        type: 'attribute',
        id: createId('attribute'),
        name: 'Nuevo Atributo',
        position: { x, y },
        keyType: 'normal',
        unique: false,
        multivalued: false,
        optional: false,
        composite: false,
        derived: false,
      };
    case 'isa':
      return {
        type: 'isa',
        id: createId('isa'),
        name: 'ISA',
        position: { x, y },
        superEntityId: null,
        subEntityIds: [],
        disjointness: 'disjoint',
        completeness: 'partial',
      };
    default:
      return null;
  }
}

export function CanvasInteraction({ children }: CanvasInteractionProps) {
  const activeTool = useDiagramStore((state) => state.activeTool);
  const addEntity = useDiagramStore((state) => state.addEntity);
  const addRelationship = useDiagramStore((state) => state.addRelationship);
  const addAttribute = useDiagramStore((state) => state.addAttribute);
  const addIsa = useDiagramStore((state) => state.addIsa);
  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);

  function handleClick(event: MouseEvent<SVGSVGElement>) {
    if (activeTool === 'select' || activeTool === 'connect') {
      return;
    }
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const element = createElement(activeTool, x, y);
    if (!element) {
      return;
    }
    if (element.type === 'entity') {
      addEntity(element);
      setSelectedElement(element.id);
      return;
    }
    if (element.type === 'relationship') {
      addRelationship(element);
      setSelectedElement(element.id);
      return;
    }
    if (element.type === 'attribute') {
      addAttribute(element);
      setSelectedElement(element.id);
      return;
    }
    addIsa(element);
    setSelectedElement(element.id);
  }

  return <g onClick={handleClick}>{children}</g>;
}
