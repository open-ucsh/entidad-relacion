import type { ElementColor } from '@/state/diagram/diagram-appearance';

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
    swatchClassName: 'bg-brand-primary',
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
    stroke: '#004574',
    fill: '#f0f6fa',
  },
  blue: {
    stroke: '#2563eb',
    fill: '#eff6ff',
  },
  emerald: {
    stroke: '#059669',
    fill: '#ecfdf5',
  },
  violet: {
    stroke: '#7c3aed',
    fill: '#f5f3ff',
  },
  orange: {
    stroke: '#ea580c',
    fill: '#fff7ed',
  },
  rose: {
    stroke: '#e11d48',
    fill: '#fff1f2',
  },
};

export function getElementAppearance(color: ElementColor | undefined): ElementAppearance {
  return ELEMENT_APPEARANCES[color ?? 'neutral'];
}
