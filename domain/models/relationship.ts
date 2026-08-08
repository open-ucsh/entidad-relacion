import type { BaseElement } from './base';

export type RelationshipKind = 'regular' | 'identifying';

export interface Relationship extends BaseElement {
  type: 'relationship';
  kind: RelationshipKind;
}
