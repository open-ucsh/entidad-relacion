'use client';

import { jsPDF } from 'jspdf';
import { useCallback, useState, type RefObject } from 'react';

import type { ExportFormat } from '../export/export.types';
import { canvasToBlob, downloadBlob, renderDiagramToCanvas } from '../export/renderDiagram';
import type { Diagram } from '@/domain/diagram/models/diagram';

export type { ExportFormat } from '../export/export.types';

interface UseCanvasExportResult {
  exportDiagram: (format: ExportFormat) => Promise<void>;
  isExporting: boolean;
  exportError: Error | null;
}

function getFileBaseName(projectName: string): string {
  const normalizedName = projectName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalizedName || 'diagrama-er';
}

export function useCanvasExport(
  svgRef: RefObject<SVGSVGElement | null>,
  diagram: Diagram,
): UseCanvasExportResult {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<Error | null>(null);

  const exportDiagram = useCallback(
    async (format: ExportFormat) => {
      const svg = svgRef.current;

      if (!svg) {
        return;
      }

      setIsExporting(true);
      setExportError(null);

      try {
        const canvas = await renderDiagramToCanvas(svg, diagram);
        const fileBaseName = getFileBaseName(diagram.metadata.name);

        if (format === 'pdf') {
          const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';

          const pdf = new jsPDF({
            orientation,
            unit: 'px',
            format: [canvas.width, canvas.height],
          });

          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);

          pdf.save(`${fileBaseName}.pdf`);
          return;
        }

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpeg' ? 0.92 : undefined;

        const blob = await canvasToBlob(canvas, mimeType, quality);

        downloadBlob(blob, `${fileBaseName}.${format}`);
      } catch (error) {
        setExportError(error instanceof Error ? error : new Error('Error al exportar el diagrama'));
      } finally {
        setIsExporting(false);
      }
    },
    [diagram, svgRef],
  );

  return {
    exportDiagram,
    isExporting,
    exportError,
  };
}
