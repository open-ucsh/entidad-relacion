import type { BaseElement } from './base';

export type RelationshipKind = 'regular' | 'identifying';
export type RelationshipMinimum = 'unspecified' | '0' | '1';
export type RelationshipMaximum = 'unspecified' | '1' | 'N';
export type RelationshipCardinality = 'unspecified' | 'one' | 'many';
export type RelationshipParticipation = 'optional' | 'mandatory';

export interface Relationship extends BaseElement {
  type: 'relationship';
  kind: RelationshipKind;
  minimum: RelationshipMinimum;
  maximum: RelationshipMaximum;
  cardinality: RelationshipCardinality;
  participation: RelationshipParticipation;
}
