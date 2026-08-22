export type ElementColor = 'neutral' | 'blue' | 'emerald' | 'violet' | 'orange' | 'rose';

export interface DiagramAppearance {
  elementColors: Record<string, ElementColor>;
}

export function createDiagramAppearance(): DiagramAppearance {
  return {
    elementColors: {},
  };
}

export function getElementColor(appearance: DiagramAppearance, elementId: string): ElementColor {
  return appearance.elementColors[elementId] ?? 'neutral';
}
