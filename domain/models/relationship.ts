import type { BaseElement } from './base';

export interface Relationship extends BaseElement {
  type: 'relationship';
  identifying: boolean;
}
