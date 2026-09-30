import { Network, Table2 } from 'lucide-react';

export type ModelView = 'conceptual' | 'logical';

interface ModelViewSwitcherProps {
  value: ModelView;
  onChange: (view: ModelView) => void;
}

export function ModelViewSwitcher({ value, onChange }: ModelViewSwitcherProps) {
  return (
    <div className="absolute left-1/2 top-4 z-60 -translate-x-1/2">
      <div
        className="flex items-center rounded-xl border border-border bg-background/95 p-1 shadow-md backdrop-blur-md"
        role="group"
        aria-label="Vista del modelo"
      >
        <button
          type="button"
          aria-pressed={value === 'conceptual'}
          onClick={() => {
            onChange('conceptual');
          }}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
            value === 'conceptual'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-text-muted hover:bg-surface-hover hover:text-text'
          }`}
        >
          <Network size={14} aria-hidden="true" />
          Modelo ER
        </button>

        <button
          type="button"
          aria-pressed={value === 'logical'}
          onClick={() => {
            onChange('logical');
          }}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
            value === 'logical'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-text-muted hover:bg-surface-hover hover:text-text'
          }`}
        >
          <Table2 size={14} aria-hidden="true" />
          Modelo lógico
        </button>
      </div>
    </div>
  );
}
