import type {
  Connection,
  ConnectionMaximum,
  ConnectionMinimum,
  Diagram,
} from '@/domain/diagram/models';
import { formatConnectionCardinality } from '@/domain/diagram/queries/connections';
import { findDiagramElement } from '@/domain/diagram/queries/elements';

import { SectionTitle, SegmentedControl } from './InspectorControls';
import { InspectorField } from './InspectorField';

const MINIMUM_OPTIONS = [
  { label: 'Sin definir', value: 'unspecified' },
  { label: 'Opcional (0)', value: 0 },
  { label: 'Obligatoria (1)', value: 1 },
] as const satisfies readonly {
  label: string;
  value: ConnectionMinimum;
}[];

const MAXIMUM_OPTIONS = [
  { label: 'Sin definir', value: 'unspecified' },
  { label: 'Una (1)', value: 1 },
  { label: 'Muchas (N)', value: 'N' },
] as const satisfies readonly {
  label: string;
  value: ConnectionMaximum;
}[];

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
  const source = findDiagramElement(diagram, connection.fromId);
  const target = findDiagramElement(diagram, connection.toId);

  if (!source || !target) {
    return (
      <p className="text-sm text-text-muted">No se encontraron los elementos de esta conexión.</p>
    );
  }

  if (source.type === 'isa' || target.type === 'isa') {
    const label =
      connection.isaRole === 'supertype'
        ? 'Supertipo de esta jerarquía'
        : connection.isaRole === 'subtype'
          ? 'Subtipo de esta jerarquía'
          : 'Rol sin definir';

    return (
      <>
        <SectionTitle>Jerarquía ISA</SectionTitle>

        <InspectorField label="Rol de la conexión">
          <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-muted">
            {label}
          </p>
        </InspectorField>

        <p className="text-xs leading-5 text-text-muted">
          Las conexiones ISA representan herencia y no usan cardinalidades.
        </p>
      </>
    );
  }

  const entity = source.type === 'entity' ? source : target.type === 'entity' ? target : undefined;

  const relationship =
    source.type === 'relationship' ? source : target.type === 'relationship' ? target : undefined;

  if (!entity || !relationship) {
    return (
      <>
        <SectionTitle>Conexión de atributo</SectionTitle>

        <p className="rounded-md border border-border bg-surface px-3 py-2 text-xs leading-5 text-text-muted">
          Esta conexión asigna un atributo a su propietario y no usa cardinalidades. Configura la
          opcionalidad y las demás propiedades seleccionando el atributo.
        </p>
      </>
    );
  }

  const cardinality = formatConnectionCardinality(connection);

  const participationDescription =
    connection.minimum === 'unspecified' || connection.maximum === 'unspecified'
      ? 'Define el mínimo y el máximo para completar la participación.'
      : connection.maximum === 1
        ? connection.minimum === 0
          ? 'Cada instancia puede participar como máximo una vez.'
          : 'Cada instancia debe participar exactamente una vez.'
        : connection.minimum === 0
          ? 'Cada instancia puede no participar o participar muchas veces.'
          : 'Cada instancia debe participar al menos una vez y puede hacerlo muchas veces.';

  return (
    <>
      <SectionTitle>Participación de la entidad</SectionTitle>

      <div className="rounded-lg border border-border bg-surface p-3">
        <p className="text-sm font-semibold text-text">{entity.name}</p>

        <p className="mt-1 text-xs text-text-muted">En la relación «{relationship.name}»</p>

        <p className="mt-2 text-sm font-semibold text-brand-primary">
          {cardinality ?? 'Participación sin completar'}
        </p>

        <p className="mt-2 text-xs leading-5 text-text-muted">{participationDescription}</p>
      </div>

      <InspectorField label="Participación mínima">
        <SegmentedControl
          value={connection.minimum}
          options={MINIMUM_OPTIONS}
          onChange={(minimum) => {
            updateConnection(connection.id, { minimum });
          }}
        />
      </InspectorField>

      <InspectorField label="Participación máxima">
        <SegmentedControl
          value={connection.maximum}
          options={MAXIMUM_OPTIONS}
          onChange={(maximum) => {
            updateConnection(connection.id, { maximum });
          }}
        />
      </InspectorField>

      <p className="text-xs leading-5 text-text-muted">
        Los valores indican cuántas veces participa cada instancia de «{entity.name}» en esta
        relación. La dirección en que dibujaste la conexión no cambia su significado.
      </p>
    </>
  );
}
