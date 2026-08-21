import { BRANDING } from '@/config/branding';
import type { Diagram } from '@/domain/diagram/models';

import { getDiagramContentBounds } from '../elements/element-geometry';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const EXPORT_SCALE = 2;
const EXPORT_PADDING = 96;

const MIN_EXPORT_WIDTH = 800;
const MIN_EXPORT_HEIGHT = 500;

const WATERMARK_WIDTH_RATIO = 0.12;
const WATERMARK_MAX_WIDTH = 140;
const WATERMARK_MARGIN = 28;
const WATERMARK_OPACITY = 0.5;

const DOCUMENT_BORDER_COLOR = '#d7dee7';

const STYLE_PROPERTIES = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-opacity',
  'stroke-width',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'color',
  'opacity',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'letter-spacing',
  'text-anchor',
  'dominant-baseline',
] as const;

interface ExportViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

function inlineComputedStyles(source: SVGSVGElement, clone: SVGSVGElement): void {
  const sourceNodes = [source, ...source.querySelectorAll('*')];
  const cloneNodes = [clone, ...clone.querySelectorAll('*')];

  sourceNodes.forEach((sourceNode, index) => {
    const cloneNode = cloneNodes[index];

    if (!(cloneNode instanceof SVGElement)) {
      return;
    }

    const computedStyles = window.getComputedStyle(sourceNode);

    const style = STYLE_PROPERTIES.map((property) => {
      const value = computedStyles.getPropertyValue(property).trim();

      return value ? `${property}:${value}` : '';
    })
      .filter(Boolean)
      .join(';');

    if (style) {
      cloneNode.setAttribute('style', style);
    }

    cloneNode.removeAttribute('class');
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = 'anonymous';

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      reject(new Error(`No se pudo cargar la imagen: ${source}`));
    };

    image.src = source;
  });
}

function getExportViewport(diagram: Diagram): ExportViewport {
  const bounds = getDiagramContentBounds(diagram);

  if (!bounds) {
    return {
      x: 0,
      y: 0,
      width: MIN_EXPORT_WIDTH,
      height: MIN_EXPORT_HEIGHT,
    };
  }

  const contentWidth = bounds.width + EXPORT_PADDING * 2;
  const contentHeight = bounds.height + EXPORT_PADDING * 2;

  const width = Math.max(contentWidth, MIN_EXPORT_WIDTH);
  const height = Math.max(contentHeight, MIN_EXPORT_HEIGHT);

  return {
    x: bounds.x - (width - bounds.width) / 2,
    y: bounds.y - (height - bounds.height) / 2,
    width,
    height,
  };
}

function createSvgRect(
  x: number,
  y: number,
  width: number,
  height: number,
  attributes: Record<string, string>,
): SVGRectElement {
  const rect = document.createElementNS(SVG_NAMESPACE, 'rect');

  rect.setAttribute('x', String(x));
  rect.setAttribute('y', String(y));
  rect.setAttribute('width', String(width));
  rect.setAttribute('height', String(height));

  Object.entries(attributes).forEach(([name, value]) => {
    rect.setAttribute(name, value);
  });

  return rect;
}

function prepareExportSvg(
  source: SVGSVGElement,
  diagram: Diagram,
): {
  clone: SVGSVGElement;
  viewport: ExportViewport;
} {
  source.setAttribute('data-exporting', 'true');

  try {
    const clone = source.cloneNode(true) as SVGSVGElement;
    const viewport = getExportViewport(diagram);

    inlineComputedStyles(source, clone);

    clone.setAttribute('xmlns', SVG_NAMESPACE);
    clone.setAttribute(
      'viewBox',
      `${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`,
    );
    clone.setAttribute('width', String(viewport.width));
    clone.setAttribute('height', String(viewport.height));
    clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    clone.querySelector('#diagram-world')?.setAttribute('transform', '');

    clone.querySelector('[data-canvas-grid]')?.remove();

    clone.querySelectorAll('[data-export-exclude]').forEach((element) => {
      element.remove();
    });

    const background = createSvgRect(viewport.x, viewport.y, viewport.width, viewport.height, {
      fill: '#ffffff',
    });

    const documentBorder = createSvgRect(
      viewport.x + 1,
      viewport.y + 1,
      viewport.width - 2,
      viewport.height - 2,
      {
        fill: 'none',
        stroke: DOCUMENT_BORDER_COLOR,
        'stroke-width': '1',
      },
    );

    clone.insertBefore(background, clone.firstChild);
    clone.appendChild(documentBorder);

    return {
      clone,
      viewport,
    };
  } finally {
    source.removeAttribute('data-exporting');
  }
}

function drawWatermark(
  context: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const desiredWidth = canvasWidth * WATERMARK_WIDTH_RATIO;
  const width = Math.min(desiredWidth, WATERMARK_MAX_WIDTH * EXPORT_SCALE);
  const height = width * (logo.height / logo.width);
  const margin = WATERMARK_MARGIN * EXPORT_SCALE;

  context.save();
  context.globalAlpha = WATERMARK_OPACITY;

  context.drawImage(
    logo,
    canvasWidth - width - margin,
    canvasHeight - height - margin,
    width,
    height,
  );

  context.restore();
}

async function renderSvgImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const serializedSvg = new XMLSerializer().serializeToString(svg);

  const blob = new Blob([serializedSvg], {
    type: 'image/svg+xml;charset=utf-8',
  });

  const objectUrl = URL.createObjectURL(blob);

  try {
    return await loadImage(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function renderDiagramToCanvas(
  svg: SVGSVGElement,
  diagram: Diagram,
): Promise<HTMLCanvasElement> {
  await document.fonts.ready;

  const { clone, viewport } = prepareExportSvg(svg, diagram);
  const image = await renderSvgImage(clone);

  const canvas = document.createElement('canvas');

  canvas.width = Math.max(Math.round(viewport.width * EXPORT_SCALE), 1);

  canvas.height = Math.max(Math.round(viewport.height * EXPORT_SCALE), 1);

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No se pudo obtener el contexto 2D del canvas');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  try {
    const logo = await loadImage(BRANDING.logo);

    drawWatermark(context, logo, canvas.width, canvas.height);
  } catch {
    // La exportación continúa aunque el logo no se pueda cargar.
  }

  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar el archivo de imagen'));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  link.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}
