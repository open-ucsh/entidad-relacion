import type { MouseEvent, PointerEvent } from 'react';

import { AttributeShape } from '@/components/elements/AttributeShape';
import { ConnectionShape } from '@/components/elements/ConnectionShape';
import { EntityShape } from '@/components/elements/EntityShape';
import { RelationshipShape } from '@/components/elements/RelationshipShape';
import type { Diagram, Tool } from '@/domain/models';
import { getConnectionEndpoints } from '@/domain/queries/connections';

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
  function handleElementClick(event: MouseEvent<SVGGElement>, id: string) {
    if (activeTool === 'delete') {
      onDeleteElement(id);
      return;
    }

    if (activeTool === 'connect') {
      onConnectClick(id);
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      onToggleElement(id);
      return;
    }

    onSelectElement(id);
  }

  function handleElementPointerDown(event: PointerEvent, id: string) {
    event.stopPropagation();

    if (activeTool === 'delete' || activeTool === 'connect') {
      return;
    }

    onElementPointerDown(event, id);
  }

  function handleElementDoubleClick(id: string) {
    if (activeTool === 'select') {
      onEditElement(id);
    }
  }

  function isSelected(id: string) {
    return selectedElementIds.includes(id) || connectionSourceId === id;
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
              onClick={() => {
                onSelectElement(connection.id);
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
