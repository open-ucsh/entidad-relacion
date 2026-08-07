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
        weak: false,
      };
    case 'relationship':
      return {
        type: 'relationship',
        id: createId('relationship'),
        name: 'Nueva Relación',
        position: { x, y },
        identifying: false,
      };
    case 'attribute':
      return {
        type: 'attribute',
        id: createId('attribute'),
        name: 'Nuevo Atributo',
        position: { x, y },
        kind: 'normal',
      };
    case 'isa':
      return {
        type: 'isa',
        id: createId('isa'),
        name: 'ISA',
        position: { x, y },
        disjointness: 'unspecified',
        completeness: 'unspecified',
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
      return;
    }
    if (element.type === 'relationship') {
      addRelationship(element);
      return;
    }
    if (element.type === 'attribute') {
      addAttribute(element);
      return;
    }
    addIsa(element);
  }

  return <g onClick={handleClick}>{children}</g>;
}
