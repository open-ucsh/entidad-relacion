import type { DiagramActivity, DiagramMetadata } from './activity';
import type { Attribute } from './attribute';
import type { Connection } from './connection';
import type { Entity } from './entity';
import type { Relationship } from './relationship';

export interface Diagram {
  entities: Entity[];
  relationships: Relationship[];
  attributes: Attribute[];
  connections: Connection[];
  metadata: DiagramMetadata;
  activity: DiagramActivity[];
}
