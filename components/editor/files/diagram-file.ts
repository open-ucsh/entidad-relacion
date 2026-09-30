import type { Diagram } from '@/domain/diagram/models';
import { createLogicalWorkspace } from '@/domain/logical/factories';
import type {
  LogicalColumn,
  LogicalForeignKey,
  LogicalRelationCardinality,
  LogicalTable,
  LogicalWorkspace,
} from '@/domain/logical/models';

import { type DiagramAppearance, type ElementColor } from '@/state/diagram/diagram-appearance';

import { isValidDiagram } from '@/domain/diagram/validation/diagram';

import { createDownloadFileBaseName } from './file-name';

const DIAGRAM_FILE_FORMAT = 'MER-designer';
const DIAGRAM_FILE_VERSION = 3;
const APPEARANCE_DIAGRAM_FILE_VERSION = 2;
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
  logicalWorkspace: LogicalWorkspace;
}

export interface ImportedDiagramFile {
  diagram: Diagram;
  appearance: DiagramAppearance;
  logicalWorkspace: LogicalWorkspace;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getLegacyAppearance(diagram: Diagram): DiagramAppearance {
  const elementColors: Record<string, ElementColor> = {};

  const collectColors = (
    elements: Array<{
      id: string;
      color?: unknown;
    }>,
  ) => {
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

function isValidCardinality(value: unknown): value is LogicalRelationCardinality {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.minimum === 0 || value.minimum === 1) && (value.maximum === 1 || value.maximum === 'N')
  );
}

function isValidLogicalColumn(value: unknown): value is LogicalColumn {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.primaryKey === 'boolean' &&
    typeof value.nullable === 'boolean' &&
    typeof value.unique === 'boolean' &&
    (value.sourceAttributeId === null || typeof value.sourceAttributeId === 'string')
  );
}

function isValidLogicalForeignKey(value: unknown): value is LogicalForeignKey {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    Array.isArray(value.columnIds) &&
    value.columnIds.every((id) => typeof id === 'string') &&
    typeof value.referencedTableId === 'string' &&
    Array.isArray(value.referencedColumnIds) &&
    value.referencedColumnIds.every((id) => typeof id === 'string') &&
    (value.sourceRelationshipId === null || typeof value.sourceRelationshipId === 'string') &&
    isValidCardinality(value.sourceCardinality) &&
    isValidCardinality(value.referencedCardinality)
  );
}

function isValidLogicalTable(value: unknown): value is LogicalTable {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.columns) &&
    value.columns.every(isValidLogicalColumn) &&
    Array.isArray(value.foreignKeys) &&
    value.foreignKeys.every(isValidLogicalForeignKey) &&
    typeof value.sourceElementId === 'string' &&
    (value.sourceType === 'entity' ||
      value.sourceType === 'relationship' ||
      value.sourceType === 'attribute')
  );
}

function isValidLogicalWorkspace(value: unknown): value is LogicalWorkspace {
  if (!isRecord(value)) {
    return false;
  }

  if (value.origin !== 'generated' && value.origin !== 'manual') {
    return false;
  }

  if (
    !isRecord(value.model) ||
    !Array.isArray(value.model.tables) ||
    !value.model.tables.every(isValidLogicalTable) ||
    !Array.isArray(value.model.diagnostics)
  ) {
    return false;
  }

  if (!isRecord(value.positions)) {
    return false;
  }

  return Object.values(value.positions).every(
    (position) =>
      isRecord(position) &&
      typeof position.x === 'number' &&
      Number.isFinite(position.x) &&
      typeof position.y === 'number' &&
      Number.isFinite(position.y),
  );
}

function createDiagramFile(
  diagram: Diagram,
  appearance: DiagramAppearance,
  logicalWorkspace: LogicalWorkspace,
): DiagramFile {
  return {
    format: DIAGRAM_FILE_FORMAT,
    version: DIAGRAM_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    diagram,
    appearance,
    logicalWorkspace,
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
    throw new Error('Este archivo no corresponde a un proyecto de MER UCSH.');
  }

  if (
    parsed.version !== LEGACY_DIAGRAM_FILE_VERSION &&
    parsed.version !== APPEARANCE_DIAGRAM_FILE_VERSION &&
    parsed.version !== DIAGRAM_FILE_VERSION
  ) {
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
      logicalWorkspace: createLogicalWorkspace(),
    };
  }

  if (!isValidAppearance(parsed.appearance)) {
    throw new Error('La apariencia visual del archivo no es válida.');
  }

  if (parsed.version === APPEARANCE_DIAGRAM_FILE_VERSION) {
    return {
      diagram,
      appearance: parsed.appearance,
      logicalWorkspace: createLogicalWorkspace(),
    };
  }

  if (!isValidLogicalWorkspace(parsed.logicalWorkspace)) {
    throw new Error('El modelo lógico del archivo no es válido.');
  }

  return {
    diagram,
    appearance: parsed.appearance,
    logicalWorkspace: parsed.logicalWorkspace,
  };
}

export function downloadDiagramFile(
  diagram: Diagram,
  appearance: DiagramAppearance,
  logicalWorkspace: LogicalWorkspace,
): void {
  const file = createDiagramFile(diagram, appearance, logicalWorkspace);

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
