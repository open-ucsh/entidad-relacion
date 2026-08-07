import type {
  AttributeKeyType,
  Diagram,
  EntityKind,
  IsaCompleteness,
  IsaDisjointness,
  RelationshipCardinality,
  RelationshipKind,
  RelationshipMaximum,
  RelationshipMinimum,
  RelationshipParticipation,
} from '@/domain/models';

import type { DiagramElement } from '@/domain/queries';
import { findElementById } from '@/domain/queries';

import { InspectorField } from './InspectorField';
import { SectionTitle, SegmentedControl, SelectControl, SwitchControl } from './InspectorControls';

const ENTITY_OPTIONS: { label: string; value: EntityKind }[] = [
  { label: 'Regular', value: 'regular' },
  { label: 'Débil', value: 'weak' },
  { label: 'Superentidad', value: 'superentity' },
  { label: 'Asociativa', value: 'associative' },
];

const ATTRIBUTE_KEY_OPTIONS: { label: string; value: AttributeKeyType }[] = [
  { label: 'Normal', value: 'normal' },
  { label: 'Clave primaria', value: 'primary' },
  { label: 'Clave parcial', value: 'partial' },
];

const RELATIONSHIP_KIND_OPTIONS: { label: string; value: RelationshipKind }[] = [
  { label: 'Regular', value: 'regular' },
  { label: 'Identificadora', value: 'identifying' },
];

const CARDINALITY_OPTIONS: { label: string; value: RelationshipCardinality }[] = [
  { label: 'No especificada', value: 'unspecified' },
  { label: 'Uno', value: 'one' },
  { label: 'Muchos', value: 'many' },
];

const PARTICIPATION_OPTIONS: { label: string; value: RelationshipParticipation }[] = [
  { label: 'Opcional', value: 'optional' },
  { label: 'Obligatoria', value: 'mandatory' },
];

const MIN_OPTIONS: { label: string; value: RelationshipMinimum }[] = [
  { label: 'No especificado', value: 'unspecified' },
  { label: '0', value: '0' },
  { label: '1', value: '1' },
];

const MAX_OPTIONS: { label: string; value: RelationshipMaximum }[] = [
  { label: 'No especificado', value: 'unspecified' },
  { label: '1', value: '1' },
  { label: 'N', value: 'N' },
];

const DISJOINTNESS_OPTIONS: { label: string; value: IsaDisjointness }[] = [
  { label: 'Disjunta', value: 'disjoint' },
  { label: 'Solapada', value: 'overlapping' },
];

const COMPLETENESS_OPTIONS: { label: string; value: IsaCompleteness }[] = [
  { label: 'Total', value: 'total' },
  { label: 'Parcial', value: 'partial' },
];

interface InspectorElementContentProps {
  element: DiagramElement;
  diagram: Diagram;
  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
}

export function InspectorElementContent({
  element,
  diagram,
  updateElement,
}: InspectorElementContentProps) {
  if (element.type === 'entity') {
    return (
      <>
        <SectionTitle>Clasificación</SectionTitle>
        <InspectorField label="Tipo de entidad">
          <SegmentedControl
            value={element.kind}
            options={ENTITY_OPTIONS}
            onChange={(kind) => {
              updateElement(element.id, { kind });
            }}
          />
        </InspectorField>
      </>
    );
  }

  if (element.type === 'attribute') {
    return (
      <>
        <SectionTitle>Clave y restricciones</SectionTitle>
        <InspectorField label="Tipo de clave">
          <SegmentedControl
            value={element.keyType}
            options={ATTRIBUTE_KEY_OPTIONS}
            onChange={(keyType) => {
              updateElement(element.id, { keyType });
            }}
          />
        </InspectorField>
        <InspectorField label="Propiedades">
          <div className="space-y-2">
            <SwitchControl
              checked={element.unique}
              label="Único"
              onChange={(unique) => {
                updateElement(element.id, { unique });
              }}
            />
            <SwitchControl
              checked={element.multivalued}
              label="Multivaluado"
              onChange={(multivalued) => {
                updateElement(element.id, { multivalued });
              }}
            />
            <SwitchControl
              checked={element.optional}
              label="Opcional"
              onChange={(optional) => {
                updateElement(element.id, { optional });
              }}
            />
            <SwitchControl
              checked={element.composite}
              label="Compuesto"
              onChange={(composite) => {
                updateElement(element.id, { composite });
              }}
            />
            <SwitchControl
              checked={element.derived}
              label="Derivado"
              onChange={(derived) => {
                updateElement(element.id, { derived });
              }}
            />
          </div>
        </InspectorField>
      </>
    );
  }

  if (element.type === 'relationship') {
    return (
      <>
        <SectionTitle>Clasificación</SectionTitle>
        <InspectorField label="Tipo de relación">
          <SegmentedControl
            value={element.kind}
            options={RELATIONSHIP_KIND_OPTIONS}
            onChange={(kind) => {
              updateElement(element.id, { kind });
            }}
          />
        </InspectorField>
        <SectionTitle>Cardinalidad</SectionTitle>
        <InspectorField label="Escala">
          <SegmentedControl
            value={element.cardinality}
            options={CARDINALITY_OPTIONS}
            onChange={(cardinality) => {
              updateElement(element.id, { cardinality });
            }}
          />
        </InspectorField>
        <InspectorField label="Participación">
          <SegmentedControl
            value={element.participation}
            options={PARTICIPATION_OPTIONS}
            onChange={(participation) => {
              updateElement(element.id, { participation });
            }}
          />
        </InspectorField>
        <InspectorField label="Mínimo">
          <SelectControl
            value={element.minimum}
            options={MIN_OPTIONS}
            onChange={(minimum) => {
              updateElement(element.id, { minimum });
            }}
          />
        </InspectorField>
        <InspectorField label="Máximo">
          <SelectControl
            value={element.maximum}
            options={MAX_OPTIONS}
            onChange={(maximum) => {
              updateElement(element.id, { maximum });
            }}
          />
        </InspectorField>
      </>
    );
  }

  const connectedEntityIds = diagram.connections
    .filter(
      (connection) => connection.sourceId === element.id || connection.targetId === element.id,
    )
    .map((connection) =>
      connection.sourceId === element.id ? connection.targetId : connection.sourceId,
    )
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .filter((id) => findElementById(diagram, id)?.type === 'entity');

  return (
    <>
      <SectionTitle>Generalización</SectionTitle>
      <InspectorField label="Superentidad">
        <SelectControl
          value={element.superEntityId ?? 'none'}
          options={[
            { label: 'Sin definir', value: 'none' },
            ...connectedEntityIds.map((id) => ({
              label: findElementById(diagram, id)?.name ?? id,
              value: id,
            })),
          ]}
          onChange={(value) => {
            const superEntityId = value === 'none' ? null : value;
            const subEntityIds = element.subEntityIds.filter((id) => id !== superEntityId);
            updateElement(element.id, { superEntityId, subEntityIds });
          }}
        />
      </InspectorField>
      <InspectorField label="Subentidades">
        <div className="space-y-2">
          {connectedEntityIds.length === 0 && (
            <p className="text-sm text-text-muted">Conecta entidades al ISA para clasificarlas.</p>
          )}
          {connectedEntityIds.map((id) => {
            const entity = findElementById(diagram, id);
            if (entity?.type !== 'entity' || id === element.superEntityId) {
              return null;
            }
            const checked = element.subEntityIds.includes(id);
            return (
              <SwitchControl
                key={id}
                checked={checked}
                label={entity.name}
                onChange={(enabled) => {
                  const subEntityIds = enabled
                    ? [...element.subEntityIds, id]
                    : element.subEntityIds.filter((subId) => subId !== id);
                  updateElement(element.id, { subEntityIds });
                }}
              />
            );
          })}
        </div>
      </InspectorField>
      <InspectorField label="Disyunción">
        <SegmentedControl
          value={element.disjointness}
          options={DISJOINTNESS_OPTIONS}
          onChange={(disjointness) => {
            updateElement(element.id, { disjointness });
          }}
        />
      </InspectorField>
      <InspectorField label="Completitud">
        <SegmentedControl
          value={element.completeness}
          options={COMPLETENESS_OPTIONS}
          onChange={(completeness) => {
            updateElement(element.id, { completeness });
          }}
        />
      </InspectorField>
    </>
  );
}
