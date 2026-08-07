'use client';

import type { Diagram } from '@/domain/models';
import { CanvasInteraction } from './CanvasInteraction';
import { CanvasLayers } from './CanvasLayers';
import { useDiagramStore } from '@/state/diagram-store';

interface CanvasProps {
  diagram: Diagram;
}

export function Canvas({ diagram }: CanvasProps) {
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);

  return (
    <main className="relative h-full min-h-0 overflow-hidden">
      <svg className="block h-full w-full">
        <CanvasInteraction>
          <CanvasLayers
            diagram={diagram}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElement}
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
