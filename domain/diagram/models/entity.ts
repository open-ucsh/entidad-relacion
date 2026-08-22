import type { BaseElement } from './element-base';

export type EntityKind = 'regular' | 'weak' | 'associative';

export interface Entity extends BaseElement {
  type: 'entity';
  kind: EntityKind;
}
