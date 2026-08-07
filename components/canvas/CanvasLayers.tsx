import type { Diagram } from '@/domain/models';

import { AttributeShape } from '@/components/elements/AttributeShape';
import { EntityShape } from '@/components/elements/EntityShape';
import { IsaShape } from '@/components/elements/IsaShape';
import { RelationshipShape } from '@/components/elements/RelationshipShape';

interface CanvasLayersProps {
  diagram: Diagram;
}

export function CanvasLayers({ diagram }: CanvasLayersProps) {
  return (
    <>
      {/* Grid */}
      <rect width="100%" height="100%" fill="url(#canvas-grid)" />

      {/* Connections */}
      <g id="connections-layer">{/* futuro: Connector */}</g>

      {/* Elements */}
      <g id="elements-layer">
        {diagram.entities.map((entity) => (
          <EntityShape key={entity.id} entity={entity} />
        ))}

        {diagram.relationships.map((relationship) => (
          <RelationshipShape key={relationship.id} relationship={relationship} />
        ))}

        {diagram.attributes.map((attribute) => (
          <AttributeShape key={attribute.id} attribute={attribute} />
        ))}

        {diagram.isas.map((isa) => (
          <IsaShape key={isa.id} isa={isa} />
        ))}
      </g>

      {/* Selection */}
      <g id="selection-layer" />

      {/* Overlay */}
      <g id="overlay-layer" />
    </>
  );
}
