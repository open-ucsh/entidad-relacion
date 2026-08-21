import type { ElementColor } from '@/domain/diagram/models';

export interface ElementColorOption {
  value: ElementColor;
  label: string;
  swatchClassName: string;
}

export interface ElementAppearance {
  stroke: string;
  fill: string;
}

export const ELEMENT_COLOR_OPTIONS = [
  {
    value: 'neutral',
    label: 'Predeterminado',
    swatchClassName: 'bg-neutral-500',
  },
  {
    value: 'blue',
    label: 'Azul',
    swatchClassName: 'bg-blue-500',
  },
  {
    value: 'emerald',
    label: 'Verde',
    swatchClassName: 'bg-emerald-500',
  },
  {
    value: 'violet',
    label: 'Violeta',
    swatchClassName: 'bg-violet-500',
  },
  {
    value: 'orange',
    label: 'Naranja',
    swatchClassName: 'bg-orange-500',
  },
  {
    value: 'rose',
    label: 'Rosa',
    swatchClassName: 'bg-rose-500',
  },
] as const satisfies readonly ElementColorOption[];

const ELEMENT_APPEARANCES: Record<ElementColor, ElementAppearance> = {
  neutral: {
    stroke: 'var(--color-border)',
    fill: 'var(--color-background)',
  },
  blue: {
    stroke: 'var(--color-blue-600)',
    fill: 'color-mix(in srgb, var(--color-blue-500) 10%, var(--color-background))',
  },
  emerald: {
    stroke: 'var(--color-emerald-600)',
    fill: 'color-mix(in srgb, var(--color-emerald-500) 10%, var(--color-background))',
  },
  violet: {
    stroke: 'var(--color-violet-600)',
    fill: 'color-mix(in srgb, var(--color-violet-500) 10%, var(--color-background))',
  },
  orange: {
    stroke: 'var(--color-orange-600)',
    fill: 'color-mix(in srgb, var(--color-orange-500) 10%, var(--color-background))',
  },
  rose: {
    stroke: 'var(--color-rose-600)',
    fill: 'color-mix(in srgb, var(--color-rose-500) 10%, var(--color-background))',
  },
};

export function getElementAppearance(color: ElementColor | undefined): ElementAppearance {
  return ELEMENT_APPEARANCES[color ?? 'neutral'];
}
