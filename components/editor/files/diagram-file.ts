import { isValidDiagram } from '@/domain/diagram/validation/diagram';
import type { Diagram } from '@/domain/diagram/models';

import { createDownloadFileBaseName } from './file-name';

const DIAGRAM_FILE_FORMAT = 'MER-designer';
const DIAGRAM_FILE_VERSION = 1;

interface DiagramFile {
  format: typeof DIAGRAM_FILE_FORMAT;
  version: typeof DIAGRAM_FILE_VERSION;
  exportedAt: string;
  diagram: Diagram;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function createDiagramFile(diagram: Diagram): DiagramFile {
  return {
    format: DIAGRAM_FILE_FORMAT,
    version: DIAGRAM_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    diagram,
  };
}

export function parseDiagramFile(content: string): Diagram {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content) as unknown;
  } catch {
    throw new Error('El archivo no contiene un JSON válido.');
  }

  if (!isRecord(parsed)) {
    throw new Error('El archivo de proyecto no tiene un formato válido.');
  }

  if (parsed.format !== DIAGRAM_FILE_FORMAT) {
    throw new Error('Este archivo no corresponde a un proyecto de ER Designer.');
  }

  if (parsed.version !== DIAGRAM_FILE_VERSION) {
    throw new Error('La versión del archivo no es compatible.');
  }

  if (!isValidDiagram(parsed.diagram)) {
    throw new Error(
      'El diagrama del archivo está incompleto, tiene referencias inválidas o no es compatible.',
    );
  }

  return parsed.diagram;
}

export function downloadDiagramFile(diagram: Diagram): void {
  const file = createDiagramFile(diagram);
  const content = JSON.stringify(file, null, 2);
  const blob = new Blob([content], {
    type: 'application/json;charset=utf-8',
  });

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = `${createDownloadFileBaseName(diagram.metadata.name)}.json`;
  link.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}
