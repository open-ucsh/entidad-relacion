import type { ReactNode } from 'react';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface SegmentedProps<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}

interface SwitchProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="border-t border-border pt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </h4>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value);
            }}
            className={`rounded-md border px-3 py-2 text-sm transition ${
              selected
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-border bg-background text-text hover:bg-surface-hover'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SwitchControl({ checked, label, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        onChange(!checked);
      }}
      className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-text hover:bg-surface-hover"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? 'bg-brand-primary' : 'bg-surface-hover'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            checked ? 'left-4' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}
