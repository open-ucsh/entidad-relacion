'use client';

import type { Connection } from '@/domain/models';

import { findElementById } from '@/domain/queries';
import { canConnect } from '@/domain/validation/rules';
import { createId } from '@/lib/id';
import { useDiagramStore } from '@/state/diagram-store';

export function useCanvasConnect() {
  const diagram = useDiagramStore((state) => state.diagram);

  const connectionSourceId = useDiagramStore((state) => state.connectionSourceId);

  const setConnectionSourceId = useDiagramStore((state) => state.setConnectionSourceId);

  const addConnection = useDiagramStore((state) => state.addConnection);

  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);

  function connect(elementId: string) {
    const element = findElementById(diagram, elementId);

    if (!element) {
      return;
    }

    if (!connectionSourceId) {
      setConnectionSourceId(elementId);
      setSelectedElement(elementId);
      return;
    }

    if (connectionSourceId === elementId) {
      return;
    }

    const source = findElementById(diagram, connectionSourceId);

    if (!source) {
      setConnectionSourceId(null);
      return;
    }

    if (!canConnect(source, element)) {
      return;
    }

    const alreadyConnected = diagram.connections.some(
      (connection) =>
        (connection.sourceId === source.id && connection.targetId === element.id) ||
        (connection.sourceId === element.id && connection.targetId === source.id),
    );

    if (alreadyConnected) {
      return;
    }

    const connection: Connection = {
      id: createId('connection'),
      sourceId: source.id,
      targetId: element.id,
      cardinality: 'unspecified',
      minimum: 'unspecified',
      maximum: 'unspecified',
      participation: 'optional',
    };

    addConnection(connection);
    setConnectionSourceId(null);
    setSelectedElement(element.id);
  }

  function cancel() {
    setConnectionSourceId(null);
  }

  return {
    connect,
    cancel,
    connectionSourceId,
  };
}
