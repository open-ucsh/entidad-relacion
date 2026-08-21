import type { PointerEvent } from 'react';

import type { Diagram, Tool } from '@/domain/diagram/models';

import {
  formatConnectionCardinality,
  getConnectionEndpoints,
} from '@/domain/diagram/queries/connections';

import { findDiagramElement } from '@/domain/diagram/queries/elements';

import { canConnectDiagramElements } from '@/domain/diagram/validation/connections';

import { AttributeShape } from './elements/AttributeShape';
import { ConnectionShape } from './elements/ConnectionShape';
import { EntityShape } from './elements/EntityShape';
import { IsaShape } from './elements/IsaShape';
import { RelationshipShape } from './elements/RelationshipShape';
import { useCanvasElementInteraction } from './hooks/useCanvasElementInteraction';

interface CanvasLayersProps {
  diagram: Diagram;
  editingElementId: string | null;
  connectionDropTargetId: string | null;
  selectedElementIds: string[];
  connectionSourceId: string | null;
  activeTool: Tool;
  onSelectElement: (id: string) => void;
  onToggleElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onElementPointerDown: (event: PointerEvent<SVGGElement>, id: string) => void;
  onConnectionHandlePointerDown: (event: PointerEvent<SVGGElement>, id: string) => void;
  onConnectClick: (id: string) => void;
  onEditElement: (id: string) => void;
}

export function CanvasLayers({
  diagram,
  editingElementId,
  selectedElementIds,
  connectionSourceId,
  connectionDropTargetId,
  activeTool,
  onSelectElement,
  onToggleElement,
  onDeleteElement,
  onElementPointerDown,
  onConnectionHandlePointerDown,
  onConnectClick,
  onEditElement,
}: CanvasLayersProps) {
  const {
    isSelected,
    handleElementClick,
    handleConnectionClick,
    handleElementPointerDown,
    handleElementDoubleClick,
  } = useCanvasElementInteraction({
    activeTool,
    selectedElementIds,
    connectionSourceId,
    onSelectElement,
    onToggleElement,
    onDeleteElement,
    onElementPointerDown,
    onConnectClick,
    onEditElement,
  });

  const connectionSource = connectionSourceId
    ? findDiagramElement(diagram, connectionSourceId)
    : undefined;

  const showConnectionTargets = Boolean(connectionSource);
  const showConnectionHandles = activeTool === 'select' || activeTool === 'connect';

  function getConnectionTargetState(id: string) {
    const target = findDiagramElement(diagram, id);

    if (!connectionSource || !target || connectionSource.id === target.id) {
      return {
        isConnectionTarget: false,
        isConnectionTargetInvalid: false,
      };
    }

    const isConnectionTarget = canConnectDiagramElements(connectionSource, target);

    return {
      isConnectionTarget,
      isConnectionTargetInvalid: !isConnectionTarget,
    };
  }

  return (
    <>
      <g id="connections-layer">
        {diagram.connections.map((connection) => {
          const endpoints = getConnectionEndpoints(diagram, connection);

          if (!endpoints) {
            return null;
          }

          return (
            <ConnectionShape
              key={connection.id}
              from={endpoints.from}
              to={endpoints.to}
              selected={selectedElementIds.includes(connection.id)}
              cardinalityLabel={formatConnectionCardinality(connection)}
              onClick={(event) => {
                handleConnectionClick(event, connection.id);
              }}
            />
          );
        })}
      </g>

      <g id="elements-layer">
        {diagram.entities.map((entity) => {
          const connectionTargetState = getConnectionTargetState(entity.id);

          return (
            <EntityShape
              key={entity.id}
              entity={entity}
              selected={isSelected(entity.id)}
              isEditing={editingElementId === entity.id}
              showConnectionHandle={showConnectionHandles}
              isConnectionDropTarget={connectionDropTargetId === entity.id}
              showConnectionTargets={showConnectionTargets}
              {...connectionTargetState}
              onClick={(event) => {
                handleElementClick(event, entity.id);
              }}
              onDoubleClick={() => {
                handleElementDoubleClick(entity.id);
              }}
              onPointerDown={(event) => {
                handleElementPointerDown(event, entity.id);
              }}
              onConnectionPointerDown={(event) => {
                onConnectionHandlePointerDown(event, entity.id);
              }}
            />
          );
        })}

        {diagram.relationships.map((relationship) => {
          const connectionTargetState = getConnectionTargetState(relationship.id);

          return (
            <RelationshipShape
              key={relationship.id}
              relationship={relationship}
              selected={isSelected(relationship.id)}
              isEditing={editingElementId === relationship.id}
              showConnectionHandle={showConnectionHandles}
              isConnectionDropTarget={connectionDropTargetId === relationship.id}
              showConnectionTargets={showConnectionTargets}
              {...connectionTargetState}
              onClick={(event) => {
                handleElementClick(event, relationship.id);
              }}
              onDoubleClick={() => {
                handleElementDoubleClick(relationship.id);
              }}
              onPointerDown={(event) => {
                handleElementPointerDown(event, relationship.id);
              }}
              onConnectionPointerDown={(event) => {
                onConnectionHandlePointerDown(event, relationship.id);
              }}
            />
          );
        })}

        {diagram.isas.map((isa) => {
          const connectionTargetState = getConnectionTargetState(isa.id);

          return (
            <IsaShape
              key={isa.id}
              isa={isa}
              selected={isSelected(isa.id)}
              showConnectionHandle={showConnectionHandles}
              isConnectionDropTarget={connectionDropTargetId === isa.id}
              showConnectionTargets={showConnectionTargets}
              {...connectionTargetState}
              onClick={(event) => {
                handleElementClick(event, isa.id);
              }}
              onPointerDown={(event) => {
                handleElementPointerDown(event, isa.id);
              }}
              onConnectionPointerDown={(event) => {
                onConnectionHandlePointerDown(event, isa.id);
              }}
            />
          );
        })}

        {diagram.attributes.map((attribute) => {
          const connectionTargetState = getConnectionTargetState(attribute.id);

          return (
            <AttributeShape
              key={attribute.id}
              attribute={attribute}
              selected={isSelected(attribute.id)}
              isEditing={editingElementId === attribute.id}
              showConnectionHandle={showConnectionHandles}
              isConnectionDropTarget={connectionDropTargetId === attribute.id}
              showConnectionTargets={showConnectionTargets}
              {...connectionTargetState}
              onClick={(event) => {
                handleElementClick(event, attribute.id);
              }}
              onDoubleClick={() => {
                handleElementDoubleClick(attribute.id);
              }}
              onPointerDown={(event) => {
                handleElementPointerDown(event, attribute.id);
              }}
              onConnectionPointerDown={(event) => {
                onConnectionHandlePointerDown(event, attribute.id);
              }}
            />
          );
        })}
      </g>
    </>
  );
}
