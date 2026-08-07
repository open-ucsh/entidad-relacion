import type { Diagram } from '@/domain/models';

import { AttributeShape } from '@/components/elements/AttributeShape';
import { EntityShape } from '@/components/elements/EntityShape';
import { IsaShape } from '@/components/elements/IsaShape';
import { RelationshipShape } from '@/components/elements/RelationshipShape';
import { Connector } from './Connector';

interface CanvasLayersProps {
  diagram: Diagram;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onElementPointerDown: (event: React.PointerEvent<SVGGElement>, id: string) => void;
}

export function CanvasLayers({
  diagram,
  selectedElementId,
  onSelectElement,
  onElementPointerDown,
}: CanvasLayersProps) {
  return (
    <>
      {/* Grid */}
      <rect width="100%" height="100%" fill="url(#canvas-grid)" />

      <g id="connections-layer" pointerEvents="none">
        {diagram.connections.map((connection) => (
          <Connector key={connection.id} connection={connection} diagram={diagram} />
        ))}
      </g>

      {/* Elements */}
      <g id="elements-layer">
        {diagram.entities.map((entity) => (
          <EntityShape
            key={entity.id}
            entity={entity}
            selected={selectedElementId === entity.id}
            onClick={() => {
              onSelectElement(entity.id);
            }}
            onPointerDown={(event) => {
              onElementPointerDown(event, entity.id);
            }}
          />
        ))}

        {diagram.relationships.map((relationship) => (
          <RelationshipShape
            key={relationship.id}
            relationship={relationship}
            selected={selectedElementId === relationship.id}
            onClick={() => {
              onSelectElement(relationship.id);
            }}
            onPointerDown={(event) => {
              onElementPointerDown(event, relationship.id);
            }}
          />
        ))}

        {diagram.attributes.map((attribute) => (
          <AttributeShape
            key={attribute.id}
            attribute={attribute}
            selected={selectedElementId === attribute.id}
            onClick={() => {
              onSelectElement(attribute.id);
            }}
            onPointerDown={(event) => {
              onElementPointerDown(event, attribute.id);
            }}
          />
        ))}

        {diagram.isas.map((isa) => (
          <IsaShape
            key={isa.id}
            isa={isa}
            selected={selectedElementId === isa.id}
            onClick={() => {
              onSelectElement(isa.id);
            }}
            onPointerDown={(event) => {
              onElementPointerDown(event, isa.id);
            }}
          />
        ))}
      </g>

      {/* Selection */}
      <g id="selection-layer" />

      {/* Overlay */}
      <g id="overlay-layer" />
    </>
  );
}
