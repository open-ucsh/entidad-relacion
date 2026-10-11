import { Network, Table2 } from 'lucide-react';

export type ModelView = 'conceptual' | 'logical';

interface ModelViewSwitcherProps {
  value: ModelView;
  onChange: (view: ModelView) => void;
}

export function ModelViewSwitcher({ value, onChange }: ModelViewSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="Vista del modelo"
      className="inline-flex max-w-full items-center gap-1 rounded-xl border border-border bg-background p-1"
    >
      <button
        type="button"
        aria-pressed={value === 'conceptual'}
        onClick={() => {
          onChange('conceptual');
        }}
        className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
          value === 'conceptual'
            ? 'bg-brand-primary text-white'
            : 'text-text-muted hover:bg-surface-hover hover:text-text'
        }`}
      >
        <Network size={15} aria-hidden="true" />
        Modelo ER
      </button>

      <button
        type="button"
        aria-pressed={value === 'logical'}
        onClick={() => {
          onChange('logical');
        }}
        className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
          value === 'logical'
            ? 'bg-brand-primary text-white'
            : 'text-text-muted hover:bg-surface-hover hover:text-text'
        }`}
      >
        <Table2 size={15} aria-hidden="true" />
        Modelo lógico
      </button>
    </div>
  );
}
