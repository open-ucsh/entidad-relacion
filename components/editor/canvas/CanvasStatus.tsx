import type { Diagram } from '@/domain/diagram/models';
import type { DiagramElement } from '@/domain/diagram/models';

interface CanvasStatusProps {
  diagram: Diagram;
  selectedElement?: DiagramElement | undefined;
  selectedElementCount: number;
  isConnectionSelected: boolean;
}

const ELEMENT_TYPE_LABELS: Record<DiagramElement['type'], string> = {
  entity: 'Entidad',
  relationship: 'Relación',
  attribute: 'Atributo',
};

export function CanvasStatus({
  diagram,
  selectedElement,
  selectedElementCount,
  isConnectionSelected,
}: CanvasStatusProps) {
  return (
    <div className="pointer-events-none absolute bottom-5 right-5 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs text-text-muted shadow-sm backdrop-blur">
      {selectedElementCount > 1 ? (
        <span>{selectedElementCount} elementos seleccionados</span>
      ) : selectedElement ? (
        <span>
          <span className="font-semibold text-text">
            {ELEMENT_TYPE_LABELS[selectedElement.type]}
          </span>
          {' · '}
          {selectedElement.name}
          {' · '}
          x: {Math.round(selectedElement.position.x)}, y: {Math.round(selectedElement.position.y)}
        </span>
      ) : isConnectionSelected ? (
        <span className="font-semibold text-text">Conexión seleccionada</span>
      ) : (
        <span>
          {diagram.entities.length} entidades · {diagram.relationships.length} relaciones ·{' '}
          {diagram.attributes.length} atributos · {diagram.connections.length} conexiones
        </span>
      )}
    </div>
  );
}
