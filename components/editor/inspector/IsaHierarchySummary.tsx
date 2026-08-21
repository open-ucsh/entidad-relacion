import type { IsaHierarchy } from '@/domain/diagram/queries/isa';

import { InspectorField } from './InspectorField';
import { SectionTitle } from './InspectorControls';

interface IsaHierarchySummaryProps {
  hierarchy: IsaHierarchy;
}

function EmptyHierarchyItem({ children }: { children: string }) {
  return (
    <p className="rounded-md border border-dashed border-border bg-background px-3 py-2.5 text-sm text-text-muted">
      {children}
    </p>
  );
}

export function IsaHierarchySummary({ hierarchy }: IsaHierarchySummaryProps) {
  return (
    <>
      <SectionTitle>Jerarquía</SectionTitle>

      <InspectorField label="Supertipo">
        {hierarchy.supertype ? (
          <p className="rounded-md border border-border bg-background px-3 py-2.5 text-sm font-medium text-text">
            {hierarchy.supertype.name}
          </p>
        ) : (
          <EmptyHierarchyItem>Sin conectar todavía</EmptyHierarchyItem>
        )}
      </InspectorField>

      <InspectorField label="Subtipos">
        {hierarchy.subtypes.length > 0 ? (
          <ul className="overflow-hidden rounded-md border border-border bg-background">
            {hierarchy.subtypes.map((subtype, index) => (
              <li
                key={subtype.id}
                className={`px-3 py-2.5 text-sm font-medium text-text ${
                  index > 0 ? 'border-t border-border' : ''
                }`}
              >
                {subtype.name}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyHierarchyItem>Sin subtipos conectados</EmptyHierarchyItem>
        )}
      </InspectorField>

      <p className="rounded-md border border-border bg-surface px-3 py-2 text-xs leading-5 text-text-muted">
        Conecta una entidad hacia ISA para definir el supertipo. Conecta ISA hacia una entidad para
        agregar un subtipo.
      </p>
    </>
  );
}
