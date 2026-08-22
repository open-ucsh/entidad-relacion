import type { BaseElement } from './element-base';

export type RelationshipKind = 'regular' | 'identifying';

export interface Relationship extends BaseElement {
  type: 'relationship';
  kind: RelationshipKind;
}
