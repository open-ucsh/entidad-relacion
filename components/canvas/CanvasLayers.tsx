import type { PointerEvent } from 'react';

import { AttributeShape } from '@/components/elements/AttributeShape';
import { ConnectionShape } from '@/components/elements/ConnectionShape';
import { EntityShape } from '@/components/elements/EntityShape';
import { RelationshipShape } from '@/components/elements/RelationshipShape';
import type { Diagram, Tool } from '@/domain/models';
import { getConnectionEndpoints } from '@/domain/queries';

interface CanvasLayersProps {
  diagram: Diagram;
  selectedElementId: string | null;
  connectionSourceId: string | null;
  activeTool: Tool;
  onSelectElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onElementPointerDown: (event: PointerEvent<SVGGElement>, id: string) => void;
  onConnectClick: (id: string) => void;
}

export function CanvasLayers({
  diagram,
  selectedElementId,
  connectionSourceId,
  activeTool,
  onSelectElement,
  onDeleteElement,
  onElementPointerDown,
  onConnectClick,
}: CanvasLayersProps) {
  function handleElementClick(id: string) {
    switch (activeTool) {
      case 'delete':
        onDeleteElement(id);
        break;

      case 'connect':
        onConnectClick(id);
        break;

      default:
        onSelectElement(id);
    }
  }

  function handleElementPointerDown(event: PointerEvent<SVGGElement>, id: string) {
    event.stopPropagation();

    if (activeTool === 'delete' || activeTool === 'connect') {
      return;
    }

    onElementPointerDown(event, id);
  }

  function isSelected(id: string) {
    return selectedElementId === id || connectionSourceId === id;
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
              selected={selectedElementId === connection.id}
              onClick={() => {
                handleElementClick(connection.id);
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
            onClick={() => {
              handleElementClick(entity.id);
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
            onClick={() => {
              handleElementClick(relationship.id);
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
            onClick={() => {
              handleElementClick(attribute.id);
            }}
            onPointerDown={(event) => {
              handleElementPointerDown(event, attribute.id);
            }}
          />
        ))}
      </g>

      <g id="selection-layer" />
      <g id="overlay-layer" />
    </>
  );
}
