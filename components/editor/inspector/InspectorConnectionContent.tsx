import type { Connection, ConnectionMaximum, ConnectionMinimum } from '@/domain/diagram/models';

import { InspectorField } from './InspectorField';
import { SectionTitle, SegmentedControl } from './InspectorControls';

const MINIMUM_OPTIONS = [
  { label: 'Sin especificar', value: 'unspecified' },
  { label: 'Opcional (0)', value: 0 },
  { label: 'Obligatoria (1)', value: 1 },
] as const satisfies readonly {
  label: string;
  value: ConnectionMinimum;
}[];

const MAXIMUM_OPTIONS = [
  { label: 'Sin especificar', value: 'unspecified' },
  { label: 'Uno (1)', value: 1 },
  { label: 'Muchos (N)', value: 'N' },
] as const satisfies readonly {
  label: string;
  value: ConnectionMaximum;
}[];

interface InspectorConnectionContentProps {
  connection: Connection;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
}

export function InspectorConnectionContent({
  connection,
  updateConnection,
}: InspectorConnectionContentProps) {
  return (
    <>
      <SectionTitle>Cardinalidad</SectionTitle>

      <InspectorField label="Participación mínima">
        <SegmentedControl
          value={connection.minimum}
          options={MINIMUM_OPTIONS}
          onChange={(minimum) => {
            updateConnection(connection.id, { minimum });
          }}
        />
      </InspectorField>

      <InspectorField label="Cardinalidad máxima">
        <SegmentedControl
          value={connection.maximum}
          options={MAXIMUM_OPTIONS}
          onChange={(maximum) => {
            updateConnection(connection.id, { maximum });
          }}
        />
      </InspectorField>

      <p className="rounded-md border border-border bg-surface px-3 py-2 text-xs leading-5 text-text-muted">
        Define ambos valores para mostrar la cardinalidad en el lienzo.
      </p>
    </>
  );
}
