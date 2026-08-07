'use client';

import { useDiagramStore } from '@/state/diagram-store';

export function Canvas() {
  const diagram = useDiagramStore((state) => state.diagram);

  return (
    <main className="relative h-full overflow-hidden bg-background">
      <svg className="h-full w-full select-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="canvas-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" className="fill-border" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#canvas-grid)" />

        <g data-layer="connections" />

        <g data-layer="elements" />

        <g data-layer="overlay" />
      </svg>

      <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs text-text-muted shadow-sm backdrop-blur">
        {diagram.entities.length} entidades · {diagram.relationships.length} relaciones ·{' '}
        {diagram.attributes.length} atributos
      </div>
    </main>
  );
}
