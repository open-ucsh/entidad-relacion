import type { BaseElement } from './base';

export type EntityKind = 'regular' | 'weak' | 'superentity' | 'associative';

export interface Entity extends BaseElement {
  type: 'entity';
  kind: EntityKind;
}
