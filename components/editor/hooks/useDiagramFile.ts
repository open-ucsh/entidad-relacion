'use client';

import { useCallback } from 'react';

import type { Diagram } from '@/domain/diagram/models';
import type { LogicalWorkspace } from '@/domain/logical/models';

import type { DiagramAppearance } from '@/state/diagram/diagram-appearance';

import { downloadDiagramFile, parseDiagramFile } from '../files/diagram-file';

interface UseDiagramFileProps {
  diagram: Diagram;
  appearance: DiagramAppearance;
  logicalWorkspace: LogicalWorkspace;
  onImportDiagram: (
    diagram: Diagram,
    appearance: DiagramAppearance,
    logicalWorkspace: LogicalWorkspace,
  ) => void;
}

export function useDiagramFile({
  diagram,
  appearance,
  logicalWorkspace,
  onImportDiagram,
}: UseDiagramFileProps) {
  const exportJson = useCallback(() => {
    downloadDiagramFile(diagram, appearance, logicalWorkspace);
  }, [appearance, diagram, logicalWorkspace]);

  const importJson = useCallback(
    async (file: File) => {
      const content = await file.text();

      const importedFile = parseDiagramFile(content);

      onImportDiagram(importedFile.diagram, importedFile.appearance, importedFile.logicalWorkspace);
    },
    [onImportDiagram],
  );

  return {
    exportJson,
    importJson,
  };
}
