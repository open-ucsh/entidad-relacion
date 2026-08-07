'use client';

import type { PointerEvent } from 'react';
import { useRef, useState } from 'react';

import type { Diagram } from '@/domain/models';
import { findElementById, getElementPosition } from '@/domain/queries';
import { createId } from '@/lib/id';
import { useDiagramStore } from '@/state/diagram-store';

import { CanvasInteraction } from './CanvasInteraction';
import { CanvasLayers } from './CanvasLayers';

interface CanvasProps {
  diagram: Diagram;
}

interface DragOffset {
  x: number;
  y: number;
}

export function Canvas({ diagram }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const selectedConnectionId = useDiagramStore((state) => state.selectedConnectionId);
  const activeTool = useDiagramStore((state) => state.activeTool);
  const connectionSourceId = useDiagramStore((state) => state.connectionSourceId);

  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);
  const setSelectedConnection = useDiagramStore((state) => state.setSelectedConnection);
  const setConnectionSourceId = useDiagramStore((state) => state.setConnectionSourceId);
  const updateElement = useDiagramStore((state) => state.updateElement);
  const addConnection = useDiagramStore((state) => state.addConnection);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<DragOffset | null>(null);

  function getSvgPoint(event: PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;

    if (!svg) {
      return null;
    }

    const matrix = svg.getScreenCTM();

    if (!matrix) {
      return null;
    }

    const point = svg.createSVGPoint();

    point.x = event.clientX;
    point.y = event.clientY;

    const svgPoint = point.matrixTransform(matrix.inverse());

    return {
      x: svgPoint.x,
      y: svgPoint.y,
    };
  }

  function handleElementPointerDown(event: PointerEvent<SVGGElement>, id: string) {
    if (activeTool !== 'select') {
      return;
    }

    event.stopPropagation();

    const position = getElementPosition(diagram, id);

    if (!position) {
      return;
    }

    const point = getSvgPoint(event as PointerEvent<SVGSVGElement>);

    if (!point) {
      return;
    }

    setSelectedElement(id);
    setDraggingId(id);

    setDragOffset({
      x: point.x - position.x,
      y: point.y - position.y,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!draggingId || !dragOffset) {
      return;
    }

    const point = getSvgPoint(event);

    if (!point) {
      return;
    }

    updateElement(draggingId, {
      position: {
        x: point.x - dragOffset.x,
        y: point.y - dragOffset.y,
      },
    });
  }

  function stopDragging() {
    setDraggingId(null);
    setDragOffset(null);
  }

  function handleElementClick(id: string) {
    if (activeTool !== 'connect') {
      setSelectedElement(id);
      return;
    }

    if (!connectionSourceId) {
      setConnectionSourceId(id);
      setSelectedElement(id);
      return;
    }

    if (connectionSourceId === id) {
      setConnectionSourceId(null);
      return;
    }

    const source = findElementById(diagram, connectionSourceId);
    const target = findElementById(diagram, id);

    if (!source || !target) {
      setConnectionSourceId(null);
      return;
    }

    const isIsaConnection =
      (source.type === 'isa' && target.type === 'entity') ||
      (source.type === 'entity' && target.type === 'isa');

    if (source.type === 'isa' && target.type === 'entity') {
      const subEntityIds = source.subEntityIds.includes(target.id)
        ? source.subEntityIds
        : [...source.subEntityIds, target.id];

      updateElement(source.id, {
        superEntityId: source.superEntityId ?? target.id,
        subEntityIds,
      });
    }

    if (source.type === 'entity' && target.type === 'isa') {
      const subEntityIds = target.subEntityIds.includes(source.id)
        ? target.subEntityIds
        : [...target.subEntityIds, source.id];

      updateElement(target.id, {
        superEntityId: target.superEntityId ?? source.id,
        subEntityIds,
      });
    }

    addConnection({
      id: createId('connection'),
      sourceId: source.id,
      targetId: target.id,
      cardinality: 'unspecified',
      minimum: 'unspecified',
      maximum: 'unspecified',
      participation: isIsaConnection ? 'mandatory' : 'optional',
    });

    setConnectionSourceId(null);
    setSelectedElement(target.id);
  }

  return (
    <main className="relative min-h-0 flex-1 overflow-hidden bg-background">
      <svg
        ref={svgRef}
        className="h-full w-full touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
      >
        <CanvasInteraction>
          <CanvasLayers
            diagram={diagram}
            selectedElementId={selectedElementId}
            selectedConnectionId={selectedConnectionId}
            onSelectElement={handleElementClick}
            onSelectConnection={setSelectedConnection}
            onElementPointerDown={handleElementPointerDown}
          />
        </CanvasInteraction>
      </svg>

      <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs text-text-muted shadow-sm backdrop-blur">
        {diagram.entities.length} entidades · {diagram.relationships.length} relaciones ·{' '}
        {diagram.attributes.length} atributos
      </div>
    </main>
  );
}
