import type { Diagram } from '@/domain/diagram/models';
import type { LogicalModel } from '@/domain/logical/models';

import { createEntityTables } from './entities';
import { transformIsaHierarchies } from './isa';
import { transformMultivaluedAttributes } from './multivalued';
import { transformRelationships } from './relationships';
import { validateWeakEntities } from './weak-entities';

export function transformDiagramToLogicalModel(diagram: Diagram): LogicalModel {
  const diagnostics: LogicalModel['diagnostics'] = [];

  const tables = createEntityTables(diagram, diagnostics);

  transformIsaHierarchies(diagram, tables, diagnostics);

  transformRelationships(diagram, tables, diagnostics);

  transformMultivaluedAttributes(diagram, tables, diagnostics);

  validateWeakEntities(diagram, diagnostics);

  return {
    tables,
    diagnostics,
  };
}
