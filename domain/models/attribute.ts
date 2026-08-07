import type { BaseElement } from './base';

export type AttributeKind = 'normal' | 'key' | 'partial-key' | 'multivalued' | 'derived';

export interface Attribute extends BaseElement {
  type: 'attribute';
  kind: AttributeKind;
}
