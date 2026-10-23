import type { LogicalWorkspace } from '@/domain/logical/models';

import { calculateRelationLines } from '../relations/lib/relation-lines';
import {
  createConnectionPath,
  getSideDirection,
  type Point,
  type Side,
} from '../relations/lib/connection-geometry';

type Cardinality = {
  minimum: 0 | 1;
  maximum: 1 | 'N';
};

function drawCardinality(
  context: CanvasRenderingContext2D,
  point: Point,
  side: Side,
  cardinality: Cardinality,
) {
  const direction = getSideDirection(side);
  const perpendicular = { x: -direction.y, y: direction.x };

  function at(distance: number): Point {
    return {
      x: point.x + direction.x * distance,
      y: point.y + direction.y * distance,
    };
  }

  function segment(first: Point, second: Point) {
    context.beginPath();
    context.moveTo(first.x, first.y);
    context.lineTo(second.x, second.y);
    context.stroke();
  }

  function bar(distance: number) {
    const center = at(distance);
    segment(
      { x: center.x - perpendicular.x * 6, y: center.y - perpendicular.y * 6 },
      { x: center.x + perpendicular.x * 6, y: center.y + perpendicular.y * 6 },
    );
  }

  if (cardinality.maximum === 'N') {
    const vertex = at(17);
    const base = at(7);
    for (const offset of [-6, 0, 6]) {
      segment(vertex, {
        x: base.x + perpendicular.x * offset,
        y: base.y + perpendicular.y * offset,
      });
    }
  } else {
    bar(7);
  }

  if (cardinality.minimum === 0) {
    const center = at(22);
    context.beginPath();
    context.arc(center.x, center.y, 3.5, 0, Math.PI * 2);
    context.fillStyle = '#ffffff';
    context.fill();
    context.stroke();
  } else {
    bar(22);
  }
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  centerY: number,
  width: number,
  lineHeight: number,
) {
  const lines: string[] = [];
  let current = '';

  for (const character of value) {
    if (current && context.measureText(current + character).width > width) {
      lines.push(current);
      current = character;
    } else {
      current += character;
    }
  }

  lines.push(current);
  const start = centerY - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    context.fillText(line, x, start + index * lineHeight);
  });
}

export async function renderLogicalModelToCanvas(
  root: HTMLElement,
  workspace: LogicalWorkspace,
): Promise<HTMLCanvasElement> {
  await document.fonts.ready;

  if (workspace.model.tables.length === 0) {
    throw new Error('Agrega una tabla antes de exportar el modelo lógico.');
  }

  const world = root.querySelector<HTMLElement>('[data-logical-world]');

  if (!world) {
    throw new Error('El canvas lógico no está disponible.');
  }

  const zoom = Number(world.dataset.logicalZoom);

  if (!Number.isFinite(zoom) || zoom <= 0) {
    throw new Error('No se pudo determinar la escala del modelo lógico.');
  }

  const worldRect = world.getBoundingClientRect();

  const measured = workspace.model.tables.map((table) => {
    const element = Array.from(world.querySelectorAll<HTMLElement>('[data-logical-table-id]')).find(
      (candidate) => candidate.dataset.logicalTableId === table.id,
    );

    if (!element) {
      throw new Error(`No se pudo medir la tabla "${table.name}".`);
    }

    const rect = element.getBoundingClientRect();

    return {
      table,
      element,
      x: (rect.left - worldRect.left) / zoom,
      y: (rect.top - worldRect.top) / zoom,
      width: rect.width / zoom,
      height: rect.height / zoom,
    };
  });

  const lines = calculateRelationLines({
    container: world,
    tables: workspace.model.tables,
    zoom,
  });

  const padding = 64;
  const minX = Math.min(...measured.map((item) => item.x)) - padding;
  const minY = Math.min(...measured.map((item) => item.y)) - padding;
  const maxX = Math.max(...measured.map((item) => item.x + item.width)) + padding;
  const maxY = Math.max(...measured.map((item) => item.y + item.height)) + padding;
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);

  // Limita el tamaño del bitmap conservando todo el contenido.
  const scale = Math.min(2, 8192 / width, 8192 / height, Math.sqrt(24000000 / (width * height)));

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(width * scale));
  canvas.height = Math.max(1, Math.ceil(height * scale));

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No se pudo crear la imagen del modelo lógico.');
  }

  const colors = getComputedStyle(root);
  const primary = colors.getPropertyValue('--color-brand-primary').trim() || '#004574';
  const border = colors.getPropertyValue('--color-border').trim() || '#d7dee7';
  const text = colors.getPropertyValue('--color-text').trim() || '#17324d';
  const surface = colors.getPropertyValue('--color-surface').trim() || '#f7f8fa';
  const fontFamily = colors.fontFamily || 'sans-serif';

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.scale(scale, scale);
  context.translate(-minX, -minY);
  context.lineJoin = 'round';
  context.lineCap = 'round';

  for (const line of lines) {
    context.strokeStyle = primary;
    context.lineWidth = 1.5;
    context.stroke(
      new Path2D(createConnectionPath(line.start, line.end, line.startSide, line.endSide)),
    );
    drawCardinality(context, line.start, line.startSide, line.sourceCardinality);
    drawCardinality(context, line.end, line.endSide, line.referencedCardinality);
  }

  for (const { table, element, x, y, width: tableWidth, height: tableHeight } of measured) {
    const header = element.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height / zoom : 48;

    context.fillStyle = '#ffffff';
    context.strokeStyle = border;
    context.lineWidth = 1;
    context.beginPath();
    context.roundRect(x, y, tableWidth, tableHeight, 10);
    context.fill();
    context.stroke();

    context.save();
    context.beginPath();
    context.roundRect(x, y, tableWidth, tableHeight, 10);
    context.clip();
    context.fillStyle = surface;
    context.fillRect(x, y, tableWidth, headerHeight);
    context.restore();

    context.strokeStyle = border;
    context.beginPath();
    context.moveTo(x, y + headerHeight);
    context.lineTo(x + tableWidth, y + headerHeight);
    context.stroke();

    context.textBaseline = 'middle';
    context.fillStyle = text;
    context.font = `600 14px ${fontFamily}`;
    drawWrappedText(context, table.name, x + 16, y + headerHeight / 2, tableWidth - 32, 20);

    const rows = Array.from(element.querySelectorAll<HTMLElement>('[data-logical-column-id]'));

    for (const column of table.columns) {
      const row = rows.find((candidate) => candidate.dataset.logicalColumnId === column.id);

      if (!row) {
        throw new Error(`No se pudo medir la columna "${column.name}".`);
      }

      const rect = row.getBoundingClientRect();
      const rowY = (rect.top - worldRect.top) / zoom;
      const rowHeight = rect.height / zoom;
      const isForeignKey = table.foreignKeys.some((key) => key.columnIds.includes(column.id));

      context.fillStyle = primary;
      context.font = `600 9px ${fontFamily}`;
      const keyLabel = [column.primaryKey ? 'PK' : '', isForeignKey ? 'FK' : '']
        .filter(Boolean)
        .join('/');
      context.fillText(keyLabel, x + 9, rowY + rowHeight / 2);

      context.fillStyle = text;
      context.font = `400 12px ${fontFamily}`;
      drawWrappedText(context, column.name, x + 46, rowY + rowHeight / 2, tableWidth - 60, 20);

      context.strokeStyle = border;
      context.beginPath();
      context.moveTo(x, rowY + rowHeight);
      context.lineTo(x + tableWidth, rowY + rowHeight);
      context.stroke();
    }
  }

  return canvas;
}
