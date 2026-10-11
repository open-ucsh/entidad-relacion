import { Circle, Diamond, FileSearch, Link2, Square } from 'lucide-react';

const ELEMENT_GUIDE = [
  {
    icon: Square,
    title: 'Entidad',
    description: 'Representa un objeto, como Alumno, Curso o Producto.',
  },
  {
    icon: Diamond,
    title: 'Relación',
    description: 'Describe cómo se vinculan dos o más entidades.',
  },
  {
    icon: Circle,
    title: 'Atributo',
    description: 'Indica una característica, como nombre, RUT o fecha.',
  },
  {
    icon: Link2,
    title: 'Conectar',
    description: 'Une elementos y define su cardinalidad.',
  },
];

export function InspectorEmpty() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
          <FileSearch
            size={19}
            strokeWidth={1.6}
            className="text-brand-primary"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text">Explora tu diagrama</h3>

          <p className="mt-1 text-xs leading-5 text-text-muted">
            Selecciona un elemento del lienzo para editar sus propiedades aquí.
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted">Guía rápida</span>

          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mt-2 overflow-hidden rounded-lg border border-border">
          {ELEMENT_GUIDE.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className={`flex gap-2.5 px-3 py-2 ${
                index !== ELEMENT_GUIDE.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-surface">
                <Icon
                  size={15}
                  strokeWidth={1.8}
                  className="text-brand-primary"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-medium text-text">{title}</h4>

                <p className="mt-0.5 text-xs leading-4 text-text-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
