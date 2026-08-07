import type { Connection, Diagram } from '@/domain/models';

interface ConnectorProps {
  connection: Connection;
  diagram: Diagram;
}

function getElementPosition(diagram: Diagram, id: string) {
  const elements = [
    ...diagram.entities,
    ...diagram.relationships,
    ...diagram.attributes,
    ...diagram.isas,
  ];

  return elements.find((element) => element.id === id)?.position ?? null;
}

export function Connector({ connection, diagram }: ConnectorProps) {
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
      className="stroke-border"
      strokeWidth={1.5}
      pointerEvents="none"
    />
  );
}
