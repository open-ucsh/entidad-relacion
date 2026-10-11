import type { PropsWithChildren } from 'react';

interface InspectorFieldProps extends PropsWithChildren {
  label: string;
}

export function InspectorField({ label, children }: InspectorFieldProps) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-medium text-text-muted">{label}</h3>

      {children}
    </section>
  );
}
