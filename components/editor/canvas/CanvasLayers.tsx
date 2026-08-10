import type { PointerEvent } from 'react';

import type { Diagram, Tool } from '@/domain/diagram/models';
import { canConnectDiagramElements } from '@/domain/diagram/validation/connections';
import { findDiagramElement } from '@/domain/diagram/queries/elements';
import {
  formatConnectionCardinality,
  getConnectionEndpoints,
} from '@/domain/diagram/queries/connections';

import { AttributeShape } from './elements/AttributeShape';
import { ConnectionShape } from './elements/ConnectionShape';
import { EntityShape } from './elements/EntityShape';
import { RelationshipShape } from './elements/RelationshipShape';
import { useCanvasElementInteraction } from './hooks/useCanvasElementInteraction';

interface CanvasLayersProps {
  diagram: Diagram;
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
  selectedElementIds,
  connectionSourceId,
  activeTool,
  onSelectElement,
  connectionDropTargetId,
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
              showConnectionHandle={activeTool === 'select'}
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
              isConnectionDropTarget={connectionDropTargetId === relationship.id}
              key={relationship.id}
              relationship={relationship}
              selected={isSelected(relationship.id)}
              showConnectionHandle={activeTool === 'select'}
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

        {diagram.attributes.map((attribute) => {
          const connectionTargetState = getConnectionTargetState(attribute.id);

          return (
            <AttributeShape
              key={attribute.id}
              isConnectionDropTarget={connectionDropTargetId === attribute.id}
              attribute={attribute}
              selected={isSelected(attribute.id)}
              showConnectionHandle={activeTool === 'select'}
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
