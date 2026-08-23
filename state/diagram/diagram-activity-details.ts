import type {
  Attribute,
  Connection,
  DiagramElement,
  Entity,
  Relationship,
} from '@/domain/diagram/models';

import type { ElementColor } from './diagram-appearance';

const ENTITY_KIND_LABELS = {
  regular: 'regular',
  weak: 'débil',
  associative: 'asociativa',
} as const;

const RELATIONSHIP_KIND_LABELS = {
  regular: 'regular',
  identifying: 'identificadora',
} as const;

const ATTRIBUTE_KEY_TYPE_LABELS = {
  normal: 'normal',
  primary: 'primaria',
  partial: 'parcial',
} as const;

const ATTRIBUTE_BOOLEAN_PROPERTIES = [
  'unique',
  'multivalued',
  'optional',
  'composite',
  'derived',
] as const;

const ATTRIBUTE_BOOLEAN_LABELS = {
  unique: 'único',
  multivalued: 'multivaluado',
  optional: 'opcional',
  composite: 'compuesto',
  derived: 'derivado',
} as const;

const ELEMENT_COLOR_LABELS: Record<ElementColor, string> = {
  neutral: 'predeterminado',
  blue: 'azul',
  emerald: 'verde',
  violet: 'violeta',
  orange: 'naranja',
  rose: 'rosa',
};

function getAttributeUpdateDetails(attribute: Attribute, updates: Partial<Attribute>): string {
  if (updates.keyType && updates.keyType !== attribute.keyType) {
    return `Se cambió la clave de “${attribute.name}” a ${ATTRIBUTE_KEY_TYPE_LABELS[updates.keyType]}.`;
  }

  for (const property of ATTRIBUTE_BOOLEAN_PROPERTIES) {
    const nextValue = updates[property];

    if (typeof nextValue === 'boolean' && nextValue !== attribute[property]) {
      return nextValue
        ? `Se marcó “${attribute.name}” como ${ATTRIBUTE_BOOLEAN_LABELS[property]}.`
        : `Se quitó la propiedad ${ATTRIBUTE_BOOLEAN_LABELS[property]} de “${attribute.name}”.`;
    }
  }

  return `Se actualizaron las propiedades de “${attribute.name}”.`;
}

export function getElementUpdateDetails(
  element: DiagramElement,
  updates: Partial<DiagramElement>,
): string {
  switch (element.type) {
    case 'entity': {
      const entityUpdates = updates as Partial<Entity>;

      if (entityUpdates.kind && entityUpdates.kind !== element.kind) {
        return `Se cambió “${element.name}” a entidad ${ENTITY_KIND_LABELS[entityUpdates.kind]}.`;
      }

      return `Se actualizaron las propiedades de “${element.name}”.`;
    }

    case 'relationship': {
      const relationshipUpdates = updates as Partial<Relationship>;

      if (relationshipUpdates.kind && relationshipUpdates.kind !== element.kind) {
        return `Se cambió “${element.name}” a relación ${RELATIONSHIP_KIND_LABELS[relationshipUpdates.kind]}.`;
      }

      return `Se actualizaron las propiedades de “${element.name}”.`;
    }

    case 'attribute':
      return getAttributeUpdateDetails(element, updates as Partial<Attribute>);

    case 'isa':
      return 'Se actualizaron las propiedades de una jerarquía ISA.';
  }
}

export function getElementColorDetails(element: DiagramElement, color: ElementColor): string {
  return color === 'neutral'
    ? `Se restauró el color predeterminado de “${element.name}”.`
    : `Se cambió el color de “${element.name}” a ${ELEMENT_COLOR_LABELS[color]}.`;
}

export function getSelectedElementsColorDetails(count: number, color: ElementColor): string {
  const elementLabel = `${count} elemento${count === 1 ? '' : 's'}`;

  return color === 'neutral'
    ? `Se restauró el color predeterminado de ${elementLabel}.`
    : `Se cambió el color de ${elementLabel} a ${ELEMENT_COLOR_LABELS[color]}.`;
}

function formatCardinalityValue(value: Connection['minimum'] | Connection['maximum']): string {
  return value === 'unspecified' ? '—' : String(value);
}

export function getConnectionUpdateDetails(
  connection: Connection,
  updates: Partial<Connection>,
): string {
  if (updates.minimum !== undefined || updates.maximum !== undefined) {
    const minimum = updates.minimum ?? connection.minimum;
    const maximum = updates.maximum ?? connection.maximum;

    return `Se actualizó la cardinalidad de la conexión a (${formatCardinalityValue(
      minimum,
    )}, ${formatCardinalityValue(maximum)}).`;
  }

  if (updates.isaRole !== undefined && updates.isaRole !== connection.isaRole) {
    return 'Se actualizó el rol ISA de una conexión.';
  }

  return 'Se actualizaron las propiedades de una conexión.';
}
