import { CanvasGrid } from './CanvasGrid';
import { CanvasLayers } from './CanvasLayers';

export function Canvas() {
  return (
    <section className="relative h-full overflow-hidden bg-background">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <CanvasGrid />
        </defs>

        <CanvasLayers />
      </svg>
    </section>
  );
}
