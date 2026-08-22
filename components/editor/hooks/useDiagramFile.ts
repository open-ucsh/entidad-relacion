'use client';

import { useCallback } from 'react';

import type { Diagram } from '@/domain/diagram/models';

import type { DiagramAppearance } from '@/state/diagram/diagram-appearance';

import { downloadDiagramFile, parseDiagramFile } from '../files/diagram-file';

interface UseDiagramFileProps {
  diagram: Diagram;
  appearance: DiagramAppearance;
  onImportDiagram: (diagram: Diagram, appearance: DiagramAppearance) => void;
}

export function useDiagramFile({ diagram, appearance, onImportDiagram }: UseDiagramFileProps) {
  const exportJson = useCallback(() => {
    downloadDiagramFile(diagram, appearance);
  }, [appearance, diagram]);

  const importJson = useCallback(
    async (file: File) => {
      const content = await file.text();
      const importedFile = parseDiagramFile(content);

      onImportDiagram(importedFile.diagram, importedFile.appearance);
    },
    [onImportDiagram],
  );

  return {
    exportJson,
    importJson,
  };
}
