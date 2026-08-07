'use client';

import type { Diagram } from '@/domain/models';

import { CanvasLayers } from './CanvasLayers';

interface CanvasProps {
  diagram: Diagram;
}

export function Canvas({ diagram }: CanvasProps) {
  return (
    <main className="relative h-full min-h-0 overflow-hidden">
      <svg className="block h-full w-full">
        <CanvasLayers diagram={diagram} />
      </svg>

      <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs text-text-muted shadow-sm backdrop-blur">
        {diagram.entities.length} entidades · {diagram.relationships.length} relaciones ·{' '}
        {diagram.attributes.length} atributos
      </div>
    </main>
  );
}
