import type { Attribute } from './attribute';
import type { Connection } from './connection';
import type { Entity } from './entity';
import type { Isa } from './isa';
import type { Relationship } from './relationship';

export interface Diagram {
  entities: Entity[];
  relationships: Relationship[];
  attributes: Attribute[];
  isas: Isa[];
  connections: Connection[];
}
