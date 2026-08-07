import type { BaseElement } from './base';

export type IsaDisjointness = 'unspecified' | 'disjoint' | 'overlapping';

export type IsaCompleteness = 'unspecified' | 'total' | 'partial';

export interface Isa extends BaseElement {
  type: 'isa';
  disjointness: IsaDisjointness;
  completeness: IsaCompleteness;
}
