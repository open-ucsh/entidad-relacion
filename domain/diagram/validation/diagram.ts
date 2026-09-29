import type {
  Attribute,
  Connection,
  Diagram,
  DiagramActivity,
  DiagramActivityType,
  DiagramMetadata,
  Entity,
  Isa,
  Point,
  Relationship,
} from '@/domain/diagram/models';

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null;
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isPoint(value: unknown): value is Point {
  return (
    isRecord(value) &&
    typeof value.x === 'number' &&
    Number.isFinite(value.x) &&
    typeof value.y === 'number' &&
    Number.isFinite(value.y)
  );
}

function hasBaseElementFields(value: unknown): value is RecordValue & {
  id: string;
  name: string;
  position: Point;
} {
  return isRecord(value) && isString(value.id) && isString(value.name) && isPoint(value.position);
}

function isEntity(value: unknown): value is Entity {
  return (
    hasBaseElementFields(value) &&
    value.type === 'entity' &&
    (value.kind === 'regular' || value.kind === 'weak' || value.kind === 'associative')
  );
}

function isRelationship(value: unknown): value is Relationship {
  return (
    hasBaseElementFields(value) &&
    value.type === 'relationship' &&
    (value.kind === 'regular' || value.kind === 'identifying')
  );
}

function isAttribute(value: unknown): value is Attribute {
  return (
    hasBaseElementFields(value) &&
    value.type === 'attribute' &&
    (value.keyType === 'normal' || value.keyType === 'primary' || value.keyType === 'partial') &&
    isBoolean(value.unique) &&
    isBoolean(value.multivalued) &&
    isBoolean(value.optional) &&
    isBoolean(value.composite) &&
    isBoolean(value.derived)
  );
}

function isIsa(value: unknown): value is Isa {
  return hasBaseElementFields(value) && value.type === 'isa';
}

function isConnection(value: unknown): value is Connection {
  return (
    isRecord(value) &&
    isString(value.id) &&
    value.type === 'connection' &&
    isString(value.fromId) &&
    isString(value.toId) &&
    (value.minimum === 'unspecified' || value.minimum === 0 || value.minimum === 1) &&
    (value.maximum === 'unspecified' || value.maximum === 1 || value.maximum === 'N') &&
    (value.isaRole === 'none' || value.isaRole === 'supertype' || value.isaRole === 'subtype')
  );
}

function isDiagramMetadata(value: unknown): value is DiagramMetadata {
  return (
    isRecord(value) &&
    isString(value.name) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    (value.origin === 'created-in-app' || value.origin === 'imported') &&
    (value.importedAt === null || isString(value.importedAt))
  );
}

function isDiagramActivityType(value: unknown): value is DiagramActivityType {
  return (
    value === 'diagram-created' ||
    value === 'diagram-imported' ||
    value === 'diagram-renamed' ||
    value === 'element-created' ||
    value === 'element-updated' ||
    value === 'element-renamed' ||
    value === 'elements-moved' ||
    value === 'elements-removed' ||
    value === 'connection-created' ||
    value === 'connection-updated'
  );
}

function isDiagramActivity(value: unknown): value is DiagramActivity {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isDiagramActivityType(value.type) &&
    isString(value.occurredAt) &&
    isString(value.details)
  );
}

function hasUniqueIds(items: Array<{ id: string }>): boolean {
  return new Set(items.map((item) => item.id)).size === items.length;
}

function hasValidConnections(
  elements: Array<Entity | Relationship | Attribute | Isa>,
  connections: Connection[],
): boolean {
  const elementById = new Map(elements.map((element) => [element.id, element]));
  const connectionKeys = new Set<string>();
  const isaSupertypeIds = new Set<string>();

  for (const connection of connections) {
    if (connection.fromId === connection.toId) {
      return false;
    }

    const source = elementById.get(connection.fromId);
    const target = elementById.get(connection.toId);

    if (!source || !target) {
      return false;
    }

    const connectionKey = `${connection.fromId}:${connection.toId}`;

    if (connectionKeys.has(connectionKey)) {
      return false;
    }

    connectionKeys.add(connectionKey);

    const isEntityRelationship =
      (source.type === 'entity' && target.type === 'relationship') ||
      (source.type === 'relationship' && target.type === 'entity');

    const isAttributeOwner =
      (source.type === 'attribute' &&
        (target.type === 'entity' || target.type === 'relationship')) ||
      (target.type === 'attribute' && (source.type === 'entity' || source.type === 'relationship'));

    const isSupertypeConnection = source.type === 'entity' && target.type === 'isa';
    const isSubtypeConnection = source.type === 'isa' && target.type === 'entity';

    if (
      !isEntityRelationship &&
      !isAttributeOwner &&
      !isSupertypeConnection &&
      !isSubtypeConnection
    ) {
      return false;
    }

    if (isSupertypeConnection) {
      if (connection.isaRole !== 'supertype' || isaSupertypeIds.has(target.id)) {
        return false;
      }

      isaSupertypeIds.add(target.id);
      continue;
    }

    if (isSubtypeConnection) {
      if (connection.isaRole !== 'subtype') {
        return false;
      }

      continue;
    }

    if (connection.isaRole !== 'none') {
      return false;
    }
  }

  return true;
}

export function isValidDiagram(value: unknown): value is Diagram {
  if (!isRecord(value)) {
    return false;
  }

  const { entities, relationships, attributes, isas, connections, metadata, activity } = value;

  if (
    !isUnknownArray(entities) ||
    !isUnknownArray(relationships) ||
    !isUnknownArray(attributes) ||
    !isUnknownArray(isas) ||
    !isUnknownArray(connections) ||
    !isUnknownArray(activity) ||
    !isDiagramMetadata(metadata) ||
    !entities.every(isEntity) ||
    !relationships.every(isRelationship) ||
    !attributes.every(isAttribute) ||
    !isas.every(isIsa) ||
    !connections.every(isConnection) ||
    !activity.every(isDiagramActivity)
  ) {
    return false;
  }

  const elements = [...entities, ...relationships, ...attributes, ...isas];

  return (
    hasUniqueIds(elements) &&
    hasUniqueIds(connections) &&
    hasValidConnections(elements, connections)
  );
}
