import type { PointerEvent } from 'react';

import type { Diagram, Tool } from '@/domain/models';

import { AttributeShape } from '@/components/elements/AttributeShape';
import { EntityShape } from '@/components/elements/EntityShape';
import { IsaShape } from '@/components/elements/IsaShape';
import { RelationshipShape } from '@/components/elements/RelationshipShape';

import { Connector } from './Connector';

interface CanvasLayersProps {
  diagram: Diagram;

  selectedElementId: string | null;
  selectedConnectionId: string | null;

  activeTool: Tool;

  onSelectElement: (id: string) => void;
  onSelectConnection: (id: string) => void;

  onConnect: (id: string) => void;

  onDeleteElement: (id: string) => void;
  onDeleteConnection: (id: string) => void;

  onElementPointerDown: (event: PointerEvent, id: string) => void;
}

export function CanvasLayers({
  diagram,
  selectedElementId,
  selectedConnectionId,
  activeTool,
  onSelectElement,
  onSelectConnection,
  onConnect,
  onDeleteElement,
  onDeleteConnection,
  onElementPointerDown,
}: CanvasLayersProps) {
  function handleElementClick(id: string) {
    if (activeTool === 'connect') {
      onConnect(id);
      return;
    }

    if (activeTool === 'delete') {
      onDeleteElement(id);
      return;
    }

    onSelectElement(id);
  }

  function handleConnectionClick(id: string) {
    if (activeTool === 'delete') {
      onDeleteConnection(id);
      return;
    }

    onSelectConnection(id);
  }

  function handleElementPointerDown(event: PointerEvent, id: string) {
    if (activeTool === 'connect' || activeTool === 'delete') {
      return;
    }

    onElementPointerDown(event, id);
  }

  return (
    <>
      <g id="connections-layer">
        {diagram.connections.map((connection) => (
          <Connector
            key={connection.id}
            connection={connection}
            diagram={diagram}
            selected={selectedConnectionId === connection.id}
            onClick={() => {
              handleConnectionClick(connection.id);
            }}
          />
        ))}
      </g>

      <g id="elements-layer">
        {diagram.entities.map((entity) => (
          <EntityShape
            key={entity.id}
            entity={entity}
            selected={selectedElementId === entity.id}
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
            selected={selectedElementId === relationship.id}
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
            selected={selectedElementId === attribute.id}
            onClick={() => {
              handleElementClick(attribute.id);
            }}
            onPointerDown={(event) => {
              handleElementPointerDown(event, attribute.id);
            }}
          />
        ))}

        {diagram.isas.map((isa) => (
          <IsaShape
            key={isa.id}
            isa={isa}
            selected={selectedElementId === isa.id}
            onClick={() => {
              handleElementClick(isa.id);
            }}
            onPointerDown={(event) => {
              handleElementPointerDown(event, isa.id);
            }}
          />
        ))}
      </g>

      <g id="selection-layer" />

      <g id="overlay-layer" />
    </>
  );
}
