import type { PropsWithChildren } from 'react';

interface InspectorFieldProps extends PropsWithChildren {
  label: string;
}

export function InspectorField({ label, children }: InspectorFieldProps) {
  return (
    <section className="space-y-2">
      <label className="block text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </label>

      {children}
    </section>
  );
}
