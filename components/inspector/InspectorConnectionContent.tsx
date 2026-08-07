import type {
  Cardinality,
  CardinalityMax,
  CardinalityMin,
  Connection,
  Diagram,
  Participation,
} from '@/domain/models';

import { findElementById } from '@/domain/queries';

import { InspectorField } from './InspectorField';
import { SectionTitle, SegmentedControl, SelectControl } from './InspectorControls';

const CARDINALITY_OPTIONS: { label: string; value: Cardinality }[] = [
  { label: 'No especificada', value: 'unspecified' },
  { label: 'Uno', value: 'one' },
  { label: 'Muchos', value: 'many' },
];

const PARTICIPATION_OPTIONS: { label: string; value: Participation }[] = [
  { label: 'Opcional', value: 'optional' },
  { label: 'Obligatoria', value: 'mandatory' },
];

const MIN_OPTIONS: { label: string; value: CardinalityMin }[] = [
  { label: 'No especificado', value: 'unspecified' },
  { label: '0', value: '0' },
  { label: '1', value: '1' },
];

const MAX_OPTIONS: { label: string; value: CardinalityMax }[] = [
  { label: 'No especificado', value: 'unspecified' },
  { label: '1', value: '1' },
  { label: 'N', value: 'N' },
];

interface InspectorConnectionContentProps {
  diagram: Diagram;
  connection: Connection;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
}

export function InspectorConnectionContent({
  diagram,
  connection,
  updateConnection,
}: InspectorConnectionContentProps) {
  const sourceName = findElementById(diagram, connection.sourceId)?.name ?? connection.sourceId;
  const targetName = findElementById(diagram, connection.targetId)?.name ?? connection.targetId;

  return (
    <>
      <SectionTitle>Conexión</SectionTitle>
      <InspectorField label="Origen y destino">
        <p className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text">
          {sourceName} → {targetName}
        </p>
      </InspectorField>
      <InspectorField label="Cardinalidad">
        <SegmentedControl
          value={connection.cardinality}
          options={CARDINALITY_OPTIONS}
          onChange={(cardinality) => {
            updateConnection(connection.id, { cardinality });
          }}
        />
      </InspectorField>
      <InspectorField label="Participación">
        <SegmentedControl
          value={connection.participation}
          options={PARTICIPATION_OPTIONS}
          onChange={(participation) => {
            updateConnection(connection.id, { participation });
          }}
        />
      </InspectorField>
      <InspectorField label="Mínimo">
        <SelectControl
          value={connection.minimum}
          options={MIN_OPTIONS}
          onChange={(minimum) => {
            updateConnection(connection.id, { minimum });
          }}
        />
      </InspectorField>
      <InspectorField label="Máximo">
        <SelectControl
          value={connection.maximum}
          options={MAX_OPTIONS}
          onChange={(maximum) => {
            updateConnection(connection.id, { maximum });
          }}
        />
      </InspectorField>
    </>
  );
}
