import { FileSearch } from 'lucide-react';

export function InspectorEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-5 rounded-full border border-border bg-background p-5">
        <FileSearch size={30} strokeWidth={1.6} className="text-text-muted" />
      </div>

      <h3 className="text-base font-semibold text-text">Nada seleccionado</h3>

      <p className="mt-2 max-w-55 text-sm leading-6 text-text-muted">
        Selecciona una entidad, relación, atributo o ISA para ver sus propiedades aquí.
      </p>
    </div>
  );
}
