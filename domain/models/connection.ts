export type Cardinality = 'unspecified' | '1' | 'N' | '(0,1)' | '(1,1)' | '(0,N)' | '(1,N)';

export type Participation = 'partial' | 'total';

export interface Connection {
  id: string;

  sourceId: string;
  targetId: string;

  cardinality: Cardinality;

  participation: Participation;
}
