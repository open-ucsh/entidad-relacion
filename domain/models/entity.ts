import type { BaseElement } from './base';

export interface Entity extends BaseElement {
  type: 'entity';
  weak: boolean;
}
