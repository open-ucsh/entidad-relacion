import type { BaseElement } from './base';

export type EntityKind = 'regular' | 'weak' | 'associative';

export interface Entity extends BaseElement {
  type: 'entity';
  kind: EntityKind;
}
