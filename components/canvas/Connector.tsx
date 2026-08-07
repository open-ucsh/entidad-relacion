import type { Connection, Diagram } from '@/domain/models';
import { getElementPosition } from '@/domain/queries';

interface ConnectorProps {
  connection: Connection;
  diagram: Diagram;
  selected: boolean;
  onClick: () => void;
}

export function Connector({ connection, diagram, selected, onClick }: ConnectorProps) {
  const source = getElementPosition(diagram, connection.sourceId);

  const target = getElementPosition(diagram, connection.targetId);

  if (!source || !target) {
    return null;
  }

  return (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      className={selected ? 'cursor-pointer stroke-brand-primary' : 'cursor-pointer stroke-border'}
      strokeWidth={selected ? 3 : 1.5}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    />
  );
}
