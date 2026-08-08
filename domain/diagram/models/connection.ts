export interface Connection {
  id: string;
  type: 'connection';
  fromId: string;
  toId: string;
}
