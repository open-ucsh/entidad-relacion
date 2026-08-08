import type { ReactNode } from 'react';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
}

interface SwitchControlProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

interface SectionTitleProps {
  children: ReactNode;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{children}</h3>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value);
            }}
            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
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

export function SwitchControl({ checked, label, onChange }: SwitchControlProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        onChange(!checked);
      }}
      className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-text transition-colors hover:bg-surface-hover"
    >
      {label}

      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? 'bg-brand-primary' : 'bg-surface-hover'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? 'left-4' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}
