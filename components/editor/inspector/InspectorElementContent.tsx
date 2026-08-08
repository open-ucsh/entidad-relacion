import type { AttributeKeyType, EntityKind, RelationshipKind } from '@/domain/diagram/models';
import type { DiagramElement } from '@/domain/diagram/queries/elements';

import { InspectorField } from './InspectorField';
import { SectionTitle, SegmentedControl, SwitchControl } from './InspectorControls';

const ENTITY_OPTIONS = [
  { label: 'Regular', value: 'regular' },
  { label: 'Débil', value: 'weak' },
  { label: 'Asociativa', value: 'associative' },
] satisfies ReadonlyArray<{ label: string; value: EntityKind }>;

const ATTRIBUTE_KEY_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Clave primaria', value: 'primary' },
  { label: 'Clave parcial', value: 'partial' },
] satisfies ReadonlyArray<{ label: string; value: AttributeKeyType }>;

const RELATIONSHIP_KIND_OPTIONS = [
  { label: 'Regular', value: 'regular' },
  { label: 'Identificadora', value: 'identifying' },
] satisfies ReadonlyArray<{ label: string; value: RelationshipKind }>;

interface InspectorElementContentProps {
  element: DiagramElement;
  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
}

export function InspectorElementContent({ element, updateElement }: InspectorElementContentProps) {
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
    </>
  );
}
