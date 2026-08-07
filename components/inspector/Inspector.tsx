import { FileSearch } from 'lucide-react';

import { Panel, PanelHeader } from '@/components/ui';

export function Inspector() {
  return (
    <aside className="h-full overflow-hidden border-l border-border">
      <Panel>
        <PanelHeader title="Propiedades" />

        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 rounded-full border border-border bg-background p-5">
            <FileSearch size={34} strokeWidth={1.6} className="text-text-muted" />
          </div>

          <h3 className="text-base font-semibold text-text">Nada seleccionado</h3>

          <p className="mt-2 max-w-xs text-sm leading-6 text-text-muted">
            Selecciona una entidad, relación, atributo o ISA para visualizar y editar sus
            propiedades.
          </p>
        </div>
      </Panel>
    </aside>
  );
}
