import { Link2 } from 'lucide-react';

import type { Connection } from '@/domain/diagram/models';
import { formatConnectionCardinality } from '@/domain/diagram/queries/connections';

interface InspectorConnectionHeaderProps {
  connection: Connection;
}

export function InspectorConnectionHeader({ connection }: InspectorConnectionHeaderProps) {
  const cardinality = formatConnectionCardinality(connection);

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20">
        <Link2 size={20} aria-hidden="true" />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Conexión</p>
        <p className="mt-0.5 text-base font-semibold text-text">
          {cardinality ?? 'Sin cardinalidad definida'}
        </p>
      </div>
    </div>
  );
}
