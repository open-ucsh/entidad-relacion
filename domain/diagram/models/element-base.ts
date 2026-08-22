export type ElementColor = 'neutral' | 'blue' | 'emerald' | 'violet' | 'orange' | 'rose';

export interface Point {
  x: number;
  y: number;
}

export interface BaseElement {
  id: string;
  name: string;
  position: Point;
  color: ElementColor;
}
