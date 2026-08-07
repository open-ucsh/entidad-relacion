'use client';

import type { PointerEvent } from 'react';
import { useRef, useState } from 'react';

import type { Diagram } from '@/domain/models';
import { createId } from '@/lib/id';
import { useDiagramStore } from '@/state/diagram-store';

import { CanvasLayers } from './CanvasLayers';
import { CanvasInteraction } from './CanvasInteraction';

interface CanvasProps {
  diagram: Diagram;
}

export function Canvas({ diagram }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);
  const updateElementPosition = useDiagramStore((state) => state.updateElementPosition);
  const addConnection = useDiagramStore((state) => state.addConnection);
  const activeTool = useDiagramStore((state) => state.activeTool);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const connectionSourceId = useDiagramStore((state) => state.connectionSourceId);

  const setConnectionSourceId = useDiagramStore((state) => state.setConnectionSourceId);

  const [dragOffset, setDragOffset] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const getElementPosition = (id: string) => {
    const elements = [
      ...diagram.entities,
      ...diagram.relationships,
      ...diagram.attributes,
      ...diagram.isas,
    ];

    return elements.find((element) => element.id === id)?.position ?? null;
  };

  const getSvgPoint = (event: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;

    if (!svg) {
      return null;
    }

    const point = svg.createSVGPoint();

    point.x = event.clientX;
    point.y = event.clientY;

    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    return {
      x: svgPoint.x,
      y: svgPoint.y,
    };
  };

  const handleElementPointerDown = (event: React.PointerEvent, id: string) => {
    if (activeTool !== 'select') {
      return;
    }

    event.stopPropagation();

    const position = getElementPosition(id);

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
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!draggingId || !dragOffset) {
      return;
    }

    const point = getSvgPoint(event);

    if (!point) {
      return;
    }

    updateElementPosition(draggingId, point.x - dragOffset.x, point.y - dragOffset.y);
  };

  const stopDragging = () => {
    setDraggingId(null);
    setDragOffset(null);
  };

  const handleElementClick = (id: string) => {
    if (activeTool === 'connect') {
      if (!connectionSourceId) {
        setConnectionSourceId(id);
        setSelectedElement(id);
        return;
      }

      if (connectionSourceId !== id) {
        addConnection({
          id: createId('connection'),
          sourceId: connectionSourceId,
          targetId: id,
          cardinality: 'unspecified',
          participation: 'partial',
        });
      }

      setConnectionSourceId(null);
      setSelectedElement(id);
      return;
    }

    setSelectedElement(id);
  };

  return (
    <main className="relative h-full w-full overflow-hidden">
      <svg
        ref={svgRef}
        className="h-full w-full"
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerLeave={stopDragging}
      >
        <CanvasInteraction>
          <CanvasLayers
            diagram={diagram}
            selectedElementId={selectedElementId}
            onSelectElement={handleElementClick}
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
