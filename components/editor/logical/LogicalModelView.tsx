'use client';

import type { Diagram } from '@/domain/diagram/models';
import { useDiagramStore } from '@/state/diagram/store';

import { LogicalCanvas } from './canvas/LogicalCanvas';

interface LogicalModelViewProps {
  diagram: Diagram;
}

export function LogicalModelView({ diagram }: LogicalModelViewProps) {
  const workspace = useDiagramStore((state) => state.logicalWorkspace);

  const generateLogicalModel = useDiagramStore((state) => state.generateLogicalModel);

  const addLogicalTable = useDiagramStore((state) => state.addLogicalTable);

  const hasConceptualModel = diagram.entities.length > 0 || diagram.relationships.length > 0;

  return (
    <LogicalCanvas
      tables={workspace.model.tables}
      positions={workspace.positions}
      diagnostics={workspace.model.diagnostics}
      canGenerateFromEr={hasConceptualModel}
      onCreateTable={addLogicalTable}
      onGenerateFromEr={generateLogicalModel}
    />
  );
}
