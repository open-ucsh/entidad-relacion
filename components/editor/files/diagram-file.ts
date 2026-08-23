import type { Diagram } from '@/domain/diagram/models';

import { type DiagramAppearance, type ElementColor } from '@/state/diagram/diagram-appearance';

import { isValidDiagram } from '@/domain/diagram/validation/diagram';

import { createDownloadFileBaseName } from './file-name';

const DIAGRAM_FILE_FORMAT = 'MER-designer';
const DIAGRAM_FILE_VERSION = 2;
const LEGACY_DIAGRAM_FILE_VERSION = 1;

const VALID_ELEMENT_COLORS = new Set<ElementColor>([
  'neutral',
  'blue',
  'emerald',
  'violet',
  'orange',
  'rose',
]);

interface DiagramFile {
  format: typeof DIAGRAM_FILE_FORMAT;
  version: typeof DIAGRAM_FILE_VERSION;
  exportedAt: string;
  diagram: Diagram;
  appearance: DiagramAppearance;
}

export interface ImportedDiagramFile {
  diagram: Diagram;
  appearance: DiagramAppearance;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getLegacyAppearance(diagram: Diagram): DiagramAppearance {
  const elementColors: Record<string, ElementColor> = {};

  const collectColors = (elements: Array<{ id: string; color?: unknown }>) => {
    elements.forEach((element) => {
      if (
        typeof element.color === 'string' &&
        VALID_ELEMENT_COLORS.has(element.color as ElementColor) &&
        element.color !== 'neutral'
      ) {
        elementColors[element.id] = element.color as ElementColor;
      }
    });
  };

  collectColors(diagram.entities);
  collectColors(diagram.relationships);
  collectColors(diagram.attributes);
  collectColors(diagram.isas);

  return {
    elementColors,
  };
}

function isValidAppearance(value: unknown): value is DiagramAppearance {
  if (!isRecord(value) || !isRecord(value.elementColors)) {
    return false;
  }

  return Object.values(value.elementColors).every(
    (color) => typeof color === 'string' && VALID_ELEMENT_COLORS.has(color as ElementColor),
  );
}

function createDiagramFile(diagram: Diagram, appearance: DiagramAppearance): DiagramFile {
  return {
    format: DIAGRAM_FILE_FORMAT,
    version: DIAGRAM_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    diagram,
    appearance,
  };
}

export function parseDiagramFile(content: string): ImportedDiagramFile {
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
    throw new Error('Este archivo no corresponde a un proyecto de MER UCSH .');
  }

  if (parsed.version !== LEGACY_DIAGRAM_FILE_VERSION && parsed.version !== DIAGRAM_FILE_VERSION) {
    throw new Error('La versión del archivo no es compatible.');
  }

  if (!isValidDiagram(parsed.diagram)) {
    throw new Error(
      'El diagrama del archivo está incompleto, tiene referencias inválidas o no es compatible.',
    );
  }

  const diagram = parsed.diagram;

  if (parsed.version === LEGACY_DIAGRAM_FILE_VERSION) {
    return {
      diagram,
      appearance: getLegacyAppearance(diagram),
    };
  }

  if (!isValidAppearance(parsed.appearance)) {
    throw new Error('La apariencia visual del archivo no es válida.');
  }

  return {
    diagram,
    appearance: parsed.appearance,
  };
}

export function downloadDiagramFile(diagram: Diagram, appearance: DiagramAppearance): void {
  const file = createDiagramFile(diagram, appearance);
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
