import type { Diagram } from '@/domain/diagram/models';

const DIAGRAM_FILE_FORMAT = 'er-designer';
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

function isDiagram(value: unknown): value is Diagram {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.entities) &&
    Array.isArray(value.relationships) &&
    Array.isArray(value.attributes) &&
    Array.isArray(value.connections) &&
    isRecord(value.metadata) &&
    Array.isArray(value.activity)
  );
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

  if (!isDiagram(parsed.diagram)) {
    throw new Error('El diagrama del archivo está incompleto o es inválido.');
  }

  return parsed.diagram;
}

function getProjectFileName(projectName: string): string {
  const normalizedName = projectName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalizedName || 'diagrama-er';
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
  link.download = `${getProjectFileName(diagram.metadata.name)}.json`;
  link.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}
