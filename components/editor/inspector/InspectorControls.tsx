import type { ReactNode } from 'react';

import type { ElementColor } from '@/state/diagram/diagram-appearance';

import { ELEMENT_COLOR_OPTIONS } from '../element-appearance';

interface Option<T extends string | number> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string | number> {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
}

interface SwitchControlProps {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

interface SectionTitleProps {
  children: ReactNode;
}

interface ColorPickerProps {
  value: ElementColor | null;
  ariaLabel?: string;
  onChange: (color: ElementColor) => void;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return <h3 className="text-xs font-semibold text-text-muted">{children}</h3>;
}

export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              onChange(option.value);
            }}
            className={`min-h-9 flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
              selected
                ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
                : 'border-border bg-background text-text-muted hover:bg-surface-hover hover:text-text'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ColorPicker({
  value,
  ariaLabel = 'Color del elemento',
  onChange,
}: ColorPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label={ariaLabel}>
      {ELEMENT_COLOR_OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => {
              onChange(option.value);
            }}
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
              selected
                ? 'border-brand-primary/40 bg-brand-primary/10'
                : 'border-transparent hover:bg-surface-hover'
            }`}
          >
            <span aria-hidden="true" className={`size-5 rounded-full ${option.swatchClassName}`} />
          </button>
        );
      })}
    </div>
  );
}

export function SwitchControl({ checked, label, disabled = false, onChange }: SwitchControlProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        onChange(!checked);
      }}
      className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-2 py-2 text-xs text-text transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background"
    >
      <span className="min-w-0 text-left">{label}</span>

      <span
        aria-hidden="true"
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand-primary' : 'bg-border'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </span>
    </button>
  );
}
