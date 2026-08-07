import type { BaseElement } from './base';

export type IsaDisjointness = 'disjoint' | 'overlapping';

export type IsaCompleteness = 'total' | 'partial';

export interface Isa extends BaseElement {
  type: 'isa';
  superEntityId: string | null;
  subEntityIds: string[];
  disjointness: IsaDisjointness;
  completeness: IsaCompleteness;
}
