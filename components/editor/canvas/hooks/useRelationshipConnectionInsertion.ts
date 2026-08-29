'use client';

import { useRef, useState } from 'react';

import type { Diagram } from '@/domain/diagram/models';
import { findDiagramElement } from '@/domain/diagram/queries/elements';
import type { ElementPositionUpdate } from '@/state/diagram/diagram-store.types';
import { useDiagramStore } from '@/state/diagram/store';

import {
  findConnectionInsertionTarget,
  type ConnectionInsertionTarget,
} from '../lib/connection-insertion-target';
import { useCanvasDrag } from './useCanvasDrag';

interface UseRelationshipConnectionInsertionOptions {
  diagram: Diagram;
  selectedElementIds: string[];
  getWorldPoint: (event: globalThis.PointerEvent) => { x: number; y: number } | null;
  onDrag: (updates: ElementPositionUpdate[]) => void;
}

export function useRelationshipConnectionInsertion({
  diagram,
  selectedElementIds,
  getWorldPoint,
  onDrag,
}: UseRelationshipConnectionInsertionOptions) {
  const moveElements = useDiagramStore((state) => state.moveElements);

  const insertRelationshipIntoConnection = useDiagramStore(
    (state) => state.insertRelationshipIntoConnection,
  );

  const beginHistoryTransaction = useDiagramStore((state) => state.beginHistoryTransaction);

  const completeHistoryTransaction = useDiagramStore((state) => state.completeHistoryTransaction);

  const cancelHistoryTransaction = useDiagramStore((state) => state.cancelHistoryTransaction);

  const insertionTargetRef = useRef<ConnectionInsertionTarget | null>(null);

  const draggedRelationshipIdRef = useRef<string | null>(null);

  const [connectionInsertionTargetId, setConnectionInsertionTargetId] = useState<string | null>(
    null,
  );

  function clearInsertionTarget() {
    insertionTargetRef.current = null;
    draggedRelationshipIdRef.current = null;
    setConnectionInsertionTargetId(null);
  }

  function updateInsertionTarget(updates: ElementPositionUpdate[]) {
    onDrag(updates);

    if (updates.length !== 1) {
      clearInsertionTarget();
      return;
    }

    const update = updates[0];

    if (!update) {
      clearInsertionTarget();
      return;
    }

    const element = findDiagramElement(diagram, update.id);

    if (!element || element.type !== 'relationship') {
      clearInsertionTarget();
      return;
    }

    const target = findConnectionInsertionTarget(diagram, element.id, update.position);

    insertionTargetRef.current = target;
    draggedRelationshipIdRef.current = element.id;

    setConnectionInsertionTargetId(target?.connectionId ?? null);
  }

  function completeMovement(movedElementCount: number) {
    const target = insertionTargetRef.current;
    const relationshipId = draggedRelationshipIdRef.current;

    if (target && relationshipId) {
      const relationship = findDiagramElement(diagram, relationshipId);

      const inserted = insertRelationshipIntoConnection(relationshipId, target.connectionId);

      if (inserted) {
        moveElements([
          {
            id: relationshipId,
            position: target.position,
          },
        ]);

        clearInsertionTarget();

        completeHistoryTransaction(
          'connection-created',
          relationship?.type === 'relationship'
            ? `Se insertó la relación "${relationship.name}" en una conexión.`
            : 'Se insertó una relación en una conexión.',
        );

        return;
      }
    }

    clearInsertionTarget();

    completeHistoryTransaction(
      'elements-moved',
      `Se movió ${movedElementCount} elemento${movedElementCount === 1 ? '' : 's'}.`,
      {
        recordActivity: false,
      },
    );
  }

  function cancelMovement() {
    clearInsertionTarget();
    cancelHistoryTransaction();
  }

  const { startDrag, drag, stopDrag } = useCanvasDrag({
    diagram,
    selectedElementIds,
    getSvgPoint: getWorldPoint,
    moveElements,
    onDrag: updateInsertionTarget,
    onMoveStarted: beginHistoryTransaction,
    onMoveCompleted: completeMovement,
    onMoveCancelled: cancelMovement,
  });

  return {
    startDrag,
    drag,
    stopDrag,
    connectionInsertionTargetId,
  };
}
