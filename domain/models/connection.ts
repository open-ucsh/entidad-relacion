export type Cardinality = 'unspecified' | 'one' | 'many';
export type CardinalityMin = 'unspecified' | '0' | '1';
export type CardinalityMax = 'unspecified' | '1' | 'N';

export type Participation = 'optional' | 'mandatory';

export interface Connection {
  id: string;

  sourceId: string;
  targetId: string;

  cardinality: Cardinality;
  minimum: CardinalityMin;
  maximum: CardinalityMax;
  participation: Participation;
}
