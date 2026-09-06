import type { Diagram, DiagramElement } from '@/domain/diagram/models';

import styles from './Canvas.module.css';

interface CanvasStatusBarProps {
  diagram: Diagram;
  selectedElement?: DiagramElement | undefined;
  selectedElementCount: number;
  isConnectionSelected: boolean;
}

const ELEMENT_TYPE_LABELS: Record<DiagramElement['type'], string> = {
  entity: 'Entidad',
  relationship: 'Relación',
  attribute: 'Atributo',
  isa: 'ISA',
};

export function CanvasStatusBar({
  diagram,
  selectedElement,
  selectedElementCount,
  isConnectionSelected,
}: CanvasStatusBarProps) {
  return (
    <div className={styles.statusBar}>
      <span className={styles.statusBarContent}>
        {selectedElementCount > 1 ? (
          <>{selectedElementCount} elementos seleccionados</>
        ) : selectedElement ? (
          <>
            <span className="font-semibold text-text">
              {ELEMENT_TYPE_LABELS[selectedElement.type]}
            </span>
            {' · '}
            {selectedElement.name}
            {' · '}
            x: {Math.round(selectedElement.position.x)}, y: {Math.round(selectedElement.position.y)}
          </>
        ) : isConnectionSelected ? (
          <span className="font-semibold text-text">Conexión seleccionada</span>
        ) : (
          <>
            {diagram.entities.length} entidades · {diagram.relationships.length} relaciones ·{' '}
            {diagram.attributes.length} atributos · {diagram.connections.length} conexiones
          </>
        )}
      </span>
    </div>
  );
}
