'use client';

import { useCallback } from 'react';

import type { Diagram } from '@/domain/diagram/models';

import { downloadDiagramFile, parseDiagramFile } from '../files/diagram-file';

interface UseDiagramFileProps {
  diagram: Diagram;
  onImportDiagram: (diagram: Diagram) => void;
}

export function useDiagramFile({ diagram, onImportDiagram }: UseDiagramFileProps) {
  const exportJson = useCallback(() => {
    downloadDiagramFile(diagram);
  }, [diagram]);

  const importJson = useCallback(
    async (file: File) => {
      const content = await file.text();
      const importedDiagram = parseDiagramFile(content);

      onImportDiagram(importedDiagram);
    },
    [onImportDiagram],
  );

  return {
    exportJson,
    importJson,
  };
}
