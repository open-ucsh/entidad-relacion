import type {
  Attribute,
  BaseElement,
  Connection,
  Diagram,
  Entity,
  Isa,
  Relationship,
} from './models';

export type DiagramElement = Entity | Relationship | Attribute | Isa;

export function getElements(diagram: Diagram): DiagramElement[] {
  return [...diagram.entities, ...diagram.relationships, ...diagram.attributes, ...diagram.isas];
}

export function findElementById(diagram: Diagram, id: string): DiagramElement | undefined {
  return getElements(diagram).find((element) => element.id === id);
}

export function findConnectionById(diagram: Diagram, id: string): Connection | undefined {
  return diagram.connections.find((connection) => connection.id === id);
}

export function getElementPosition(
  diagram: Diagram,
  id: string,
): BaseElement['position'] | undefined {
  return findElementById(diagram, id)?.position;
}

export function getIncomingConnections(diagram: Diagram, elementId: string): Connection[] {
  return diagram.connections.filter((connection) => connection.targetId === elementId);
}

export function getOutgoingConnections(diagram: Diagram, elementId: string): Connection[] {
  return diagram.connections.filter((connection) => connection.sourceId === elementId);
}

export function getConnections(diagram: Diagram, elementId: string): Connection[] {
  return diagram.connections.filter(
    (connection) => connection.sourceId === elementId || connection.targetId === elementId,
  );
}

export function getConnectedElements(diagram: Diagram, elementId: string): DiagramElement[] {
  return getConnections(diagram, elementId)
    .map((connection) => {
      const otherId = connection.sourceId === elementId ? connection.targetId : connection.sourceId;

      return findElementById(diagram, otherId);
    })
    .filter((element): element is DiagramElement => element !== undefined);
}

export function hasConnections(diagram: Diagram, elementId: string): boolean {
  return getConnections(diagram, elementId).length > 0;
}
