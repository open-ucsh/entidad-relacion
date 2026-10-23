'use client';

import type { RefObject } from 'react';
import { useDiagramStore } from '@/state/diagram/store';

import { LogicalCanvas } from './canvas/LogicalCanvas';
import { useLogicalSelectionStore } from './logical-selection';

export function LogicalModelView({ exportRef }: { exportRef?: RefObject<HTMLDivElement | null> }) {
  const workspace = useDiagramStore((state) => state.logicalWorkspace);

  const selection = useLogicalSelectionStore((state) => state.selection);
  const setSelection = useLogicalSelectionStore((state) => state.setSelection);

  return (
    <div ref={exportRef} className="h-full min-h-0">
      <LogicalCanvas
        tables={workspace.model.tables}
        positions={workspace.positions}
        selection={selection}
        onSelectionChange={setSelection}
      />
    </div>
  );
}
