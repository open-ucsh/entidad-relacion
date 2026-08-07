import type { BaseElement } from './base';

export type AttributeKeyType = 'normal' | 'primary' | 'partial';

export interface Attribute extends BaseElement {
  type: 'attribute';
  keyType: AttributeKeyType;
  unique: boolean;
  multivalued: boolean;
  optional: boolean;
  composite: boolean;
  derived: boolean;
}
