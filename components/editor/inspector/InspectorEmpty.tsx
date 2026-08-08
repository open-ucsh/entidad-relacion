import { FileSearch } from 'lucide-react';

export function InspectorEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full border border-border bg-background">
        <FileSearch size={32} className="text-text-muted" />
      </div>

      <h3 className="mt-5 text-base font-semibold text-text">Nada seleccionado</h3>

      <p className="mt-2 max-w-56 text-sm leading-6 text-text-muted">
        Selecciona un elemento o una conexión para ver sus propiedades aquí.
      </p>
    </div>
  );
}
