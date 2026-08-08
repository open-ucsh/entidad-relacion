export type ConnectionMinimum = 'unspecified' | 0 | 1;
export type ConnectionMaximum = 'unspecified' | 1 | 'N';

export interface Connection {
  id: string;
  type: 'connection';
  fromId: string;
  toId: string;
  minimum: ConnectionMinimum;
  maximum: ConnectionMaximum;
}
