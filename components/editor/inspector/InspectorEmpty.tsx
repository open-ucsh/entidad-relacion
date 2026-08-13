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
    <div className="flex h-full flex-col overflow-y-auto px-6 py-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-surface">
          <FileSearch size={26} strokeWidth={1.6} className="text-brand-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-text">Explora tu diagrama</h3>
        <p className="mt-1.5 max-w-64 text-sm leading-6 text-text-muted">
          Selecciona un elemento del lienzo para editar sus propiedades aquí.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Guía rápida
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface/50">
          {ELEMENT_GUIDE.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className={`flex gap-3 px-4 py-3.5 ${
                i !== ELEMENT_GUIDE.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                <Icon size={15} strokeWidth={1.8} className="text-brand-primary" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-text">{title}</h4>
                <p className="mt-0.5 text-xs leading-5 text-text-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
