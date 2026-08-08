import type { PointerEvent } from 'react';

import type { Diagram, Tool } from '@/domain/diagram/models';
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
  selectedElementIds: string[];
  connectionSourceId: string | null;
  activeTool: Tool;
  onSelectElement: (id: string) => void;
  onToggleElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onElementPointerDown: (event: PointerEvent, id: string) => void;
  onConnectClick: (id: string) => void;
  onEditElement: (id: string) => void;
}

export function CanvasLayers({
  diagram,
  selectedElementIds,
  connectionSourceId,
  activeTool,
  onSelectElement,
  onToggleElement,
  onDeleteElement,
  onElementPointerDown,
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
        {diagram.entities.map((entity) => (
          <EntityShape
            key={entity.id}
            entity={entity}
            selected={isSelected(entity.id)}
            onClick={(event) => {
              handleElementClick(event, entity.id);
            }}
            onDoubleClick={() => {
              handleElementDoubleClick(entity.id);
            }}
            onPointerDown={(event) => {
              handleElementPointerDown(event, entity.id);
            }}
          />
        ))}

        {diagram.relationships.map((relationship) => (
          <RelationshipShape
            key={relationship.id}
            relationship={relationship}
            selected={isSelected(relationship.id)}
            onClick={(event) => {
              handleElementClick(event, relationship.id);
            }}
            onDoubleClick={() => {
              handleElementDoubleClick(relationship.id);
            }}
            onPointerDown={(event) => {
              handleElementPointerDown(event, relationship.id);
            }}
          />
        ))}

        {diagram.attributes.map((attribute) => (
          <AttributeShape
            key={attribute.id}
            attribute={attribute}
            selected={isSelected(attribute.id)}
            onClick={(event) => {
              handleElementClick(event, attribute.id);
            }}
            onDoubleClick={() => {
              handleElementDoubleClick(attribute.id);
            }}
            onPointerDown={(event) => {
              handleElementPointerDown(event, attribute.id);
            }}
          />
        ))}
      </g>
    </>
  );
}
