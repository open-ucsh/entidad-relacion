import type { Diagram, Relationship } from '@/domain/diagram/models';
import type {
  LogicalDiagnostic,
  LogicalRelationCardinality,
  LogicalTable,
} from '@/domain/logical/models';
import {
  getRelationshipAttributes,
  getRelationshipParticipants,
  type RelationshipParticipant,
} from '@/domain/logical/queries/ownership';

import { addForeignKey } from './foreign-keys';
import {
  createAttributeColumnId,
  createEntityTableId,
  createRelationshipTableId,
  toLogicalName,
} from './naming';

type BinaryRelationshipParticipants = [RelationshipParticipant, RelationshipParticipant];

function isBinaryRelationship(
  participants: RelationshipParticipant[],
): participants is BinaryRelationshipParticipants {
  return participants.length === 2;
}

function findEntityTable(tables: LogicalTable[], entityId: string): LogicalTable | undefined {
  return tables.find((table) => table.id === createEntityTableId(entityId));
}

function getParticipantCardinality(
  participant: RelationshipParticipant,
): LogicalRelationCardinality {
  return {
    minimum: participant.connection.minimum === 1 ? 1 : 0,
    maximum: participant.connection.maximum === 'N' ? 'N' : 1,
  };
}

function addRelationshipAttributes(
  diagram: Diagram,
  relationship: Relationship,
  table: LogicalTable,
): void {
  const attributes = getRelationshipAttributes(diagram, relationship.id);

  for (const attribute of attributes) {
    if (attribute.derived || attribute.multivalued) {
      continue;
    }

    table.columns.push({
      id: createAttributeColumnId(attribute.id),
      name: toLogicalName(attribute.name),
      primaryKey: attribute.keyType === 'primary',
      nullable: attribute.optional,
      unique: attribute.unique || attribute.keyType === 'primary',
      sourceAttributeId: attribute.id,
    });
  }
}

function addMissingReferencedKeyDiagnostic(
  diagnostics: LogicalDiagnostic[],
  relationship: Relationship,
  table: LogicalTable,
): void {
  diagnostics.push({
    id: `logical:diagnostic:relationship-key:${relationship.id}:${table.id}`,
    severity: 'error',
    sourceElementId: relationship.id,
    message: `No se puede transformar "${relationship.name}" porque "${table.name}" no tiene una clave primaria.`,
  });
}

function transformManyToMany(
  diagram: Diagram,
  relationship: Relationship,
  participants: BinaryRelationshipParticipants,
  tables: LogicalTable[],
  diagnostics: LogicalDiagnostic[],
): void {
  const relationshipTable: LogicalTable = {
    id: createRelationshipTableId(relationship.id),
    name: toLogicalName(relationship.name),
    columns: [],
    foreignKeys: [],
    sourceElementId: relationship.id,
    sourceType: 'relationship',
  };

  for (const participant of participants) {
    const entityTable = findEntityTable(tables, participant.entity.id);

    if (!entityTable) {
      continue;
    }

    const added = addForeignKey({
      sourceId: `${relationship.id}:${participant.entity.id}`,
      sourceRelationshipId: relationship.id,
      referencedTable: entityTable,
      targetTable: relationshipTable,
      nullable: false,
      primaryKey: true,

      /*
       * Cada fila de la tabla intermedia pertenece
       * exactamente a una fila de la entidad.
       *
       * Una fila de la entidad puede aparecer en
       * varias filas de la tabla intermedia.
       */
      sourceCardinality: getParticipantCardinality(participant),
      referencedCardinality: {
        minimum: 1,
        maximum: 1,
      },
    });

    if (!added) {
      addMissingReferencedKeyDiagnostic(diagnostics, relationship, entityTable);
    }
  }

  addRelationshipAttributes(diagram, relationship, relationshipTable);

  tables.push(relationshipTable);
}

function transformOneToMany(
  diagram: Diagram,
  relationship: Relationship,
  one: RelationshipParticipant,
  many: RelationshipParticipant,
  tables: LogicalTable[],
  diagnostics: LogicalDiagnostic[],
): void {
  const oneTable = findEntityTable(tables, one.entity.id);

  const manyTable = findEntityTable(tables, many.entity.id);

  if (!oneTable || !manyTable) {
    return;
  }

  const identifying = relationship.kind === 'identifying' && many.entity.kind === 'weak';

  const added = addForeignKey({
    sourceId: `${relationship.id}:${many.entity.id}`,
    sourceRelationshipId: relationship.id,
    referencedTable: oneTable,
    targetTable: manyTable,
    nullable: identifying ? false : many.connection.minimum === 0,
    primaryKey: identifying,

    sourceCardinality: getParticipantCardinality(many),

    referencedCardinality: getParticipantCardinality(one),
  });

  if (!added) {
    addMissingReferencedKeyDiagnostic(diagnostics, relationship, oneTable);

    return;
  }

  addRelationshipAttributes(diagram, relationship, manyTable);
}

function selectOneToOneTarget(
  relationship: Relationship,
  participants: BinaryRelationshipParticipants,
  diagnostics: LogicalDiagnostic[],
): {
  referenced: RelationshipParticipant;
  target: RelationshipParticipant;
} {
  const [first, second] = participants;

  if (first.connection.minimum === 1 && second.connection.minimum !== 1) {
    return {
      referenced: second,
      target: first,
    };
  }

  if (second.connection.minimum === 1 && first.connection.minimum !== 1) {
    return {
      referenced: first,
      target: second,
    };
  }

  diagnostics.push({
    id: `logical:diagnostic:ambiguous-one-to-one:${relationship.id}`,
    severity: 'warning',
    sourceElementId: relationship.id,
    message: `La relación 1:1 "${relationship.name}" es ambigua. Se aplicó una ubicación determinista para la clave foránea.`,
  });

  if (first.entity.id.localeCompare(second.entity.id) <= 0) {
    return {
      referenced: first,
      target: second,
    };
  }

  return {
    referenced: second,
    target: first,
  };
}

function transformOneToOne(
  diagram: Diagram,
  relationship: Relationship,
  participants: BinaryRelationshipParticipants,
  tables: LogicalTable[],
  diagnostics: LogicalDiagnostic[],
): void {
  const { referenced, target } = selectOneToOneTarget(relationship, participants, diagnostics);

  const referencedTable = findEntityTable(tables, referenced.entity.id);

  const targetTable = findEntityTable(tables, target.entity.id);

  if (!referencedTable || !targetTable) {
    return;
  }

  const added = addForeignKey({
    sourceId: `${relationship.id}:${target.entity.id}`,
    sourceRelationshipId: relationship.id,
    referencedTable,
    targetTable,
    nullable: target.connection.minimum === 0,
    unique: true,

    sourceCardinality: getParticipantCardinality(target),

    referencedCardinality: getParticipantCardinality(referenced),
  });

  if (!added) {
    addMissingReferencedKeyDiagnostic(diagnostics, relationship, referencedTable);

    return;
  }

  addRelationshipAttributes(diagram, relationship, targetTable);
}

export function transformRelationships(
  diagram: Diagram,
  tables: LogicalTable[],
  diagnostics: LogicalDiagnostic[],
): void {
  for (const relationship of diagram.relationships) {
    const participants = getRelationshipParticipants(diagram, relationship.id);

    if (!isBinaryRelationship(participants)) {
      diagnostics.push({
        id: `logical:diagnostic:relationship-arity:${relationship.id}`,
        severity: 'error',
        sourceElementId: relationship.id,
        message: `La relación "${relationship.name}" necesita exactamente dos entidades para transformarse automáticamente.`,
      });

      continue;
    }

    if (
      relationship.kind === 'identifying' &&
      !participants.some((participant) => participant.entity.kind === 'weak')
    ) {
      diagnostics.push({
        id: `logical:diagnostic:identifying-without-weak:${relationship.id}`,
        severity: 'warning',
        sourceElementId: relationship.id,
        message: `La relación identificadora "${relationship.name}" no está conectada a ninguna entidad débil.`,
      });
    }

    if (
      participants.some(
        (participant) =>
          participant.connection.minimum === 'unspecified' ||
          participant.connection.maximum === 'unspecified',
      )
    ) {
      diagnostics.push({
        id: `logical:diagnostic:cardinality:${relationship.id}`,
        severity: 'error',
        sourceElementId: relationship.id,
        message: `Define la cardinalidad completa de "${relationship.name}" para generar su modelo lógico.`,
      });

      continue;
    }

    const [first, second] = participants;

    if (first.connection.maximum === 'N' && second.connection.maximum === 'N') {
      transformManyToMany(diagram, relationship, participants, tables, diagnostics);

      continue;
    }

    if (first.connection.maximum === 1 && second.connection.maximum === 'N') {
      transformOneToMany(diagram, relationship, first, second, tables, diagnostics);

      continue;
    }

    if (first.connection.maximum === 'N' && second.connection.maximum === 1) {
      transformOneToMany(diagram, relationship, second, first, tables, diagnostics);

      continue;
    }

    transformOneToOne(diagram, relationship, participants, tables, diagnostics);
  }
}
