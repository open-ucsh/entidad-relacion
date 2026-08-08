'use client';

import { jsPDF } from 'jspdf';
import { useCallback, useState, type RefObject } from 'react';

import { BRANDING } from '@/config/branding';

import type { ExportFormat } from '../export/export.types';
import { canvasToBlob, downloadBlob, renderDiagramToCanvas } from '../export/renderDiagram';

export type { ExportFormat } from '../export/export.types';

interface UseCanvasExportResult {
  exportDiagram: (format: ExportFormat) => Promise<void>;
  isExporting: boolean;
  exportError: Error | null;
}

function getFileBaseName(): string {
  return BRANDING.applicationName.toLowerCase().replace(/\s+/g, '-');
}

export function useCanvasExport(svgRef: RefObject<SVGSVGElement | null>): UseCanvasExportResult {
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
        const canvas = await renderDiagramToCanvas(svg);
        const fileBaseName = getFileBaseName();

        if (format === 'pdf') {
          const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';

          const pdf = new jsPDF({
            orientation,
            unit: 'px',
            format: [canvas.width, canvas.height],
          });

          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);

          pdf.save(`${fileBaseName}-diagrama.pdf`);
          return;
        }

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpeg' ? 0.92 : undefined;

        const blob = await canvasToBlob(canvas, mimeType, quality);

        downloadBlob(blob, `${fileBaseName}-diagrama.${format}`);
      } catch (error) {
        setExportError(error instanceof Error ? error : new Error('Error al exportar el diagrama'));
      } finally {
        setIsExporting(false);
      }
    },
    [svgRef],
  );

  return {
    exportDiagram,
    isExporting,
    exportError,
  };
}
