import type { Diagram } from '@/domain/diagram/models';
import { getDiagramContentBounds } from '../elements/element-geometry';

import { BRANDING } from '@/config/branding';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const EXPORT_SCALE = 2;
const WATERMARK_WIDTH_RATIO = 0.16;
const WATERMARK_MARGIN = 16 * EXPORT_SCALE;
const WATERMARK_OPACITY = 0.55;

const EMPTY_EXPORT_WIDTH = 1200;
const EMPTY_EXPORT_HEIGHT = 800;

const STYLE_PROPERTIES = [
  'fill',
  'stroke',
  'color',
  'opacity',
  'stroke-width',
  'stroke-dasharray',
  'font-size',
  'font-weight',
  'text-anchor',
] as const;

interface ExportViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

function inlineComputedStyles(source: SVGSVGElement, clone: SVGSVGElement): void {
  const sourceNodes = source.querySelectorAll('*');
  const cloneNodes = clone.querySelectorAll('*');

  sourceNodes.forEach((sourceNode, index) => {
    const cloneNode = cloneNodes[index];

    if (!(cloneNode instanceof SVGElement)) {
      return;
    }

    const computedStyles = window.getComputedStyle(sourceNode);
    const style = STYLE_PROPERTIES.map((property) => {
      const value = computedStyles.getPropertyValue(property);

      return value ? `${property}:${value}` : '';
    })
      .filter(Boolean)
      .join(';');

    if (style) {
      cloneNode.setAttribute('style', style);
    }
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
  return (
    getDiagramContentBounds(diagram) ?? {
      x: 0,
      y: 0,
      width: EMPTY_EXPORT_WIDTH,
      height: EMPTY_EXPORT_HEIGHT,
    }
  );
}

function prepareExportSvg(
  source: SVGSVGElement,
  diagram: Diagram,
): { clone: SVGSVGElement; viewport: ExportViewport } {
  const clone = source.cloneNode(true) as SVGSVGElement;
  const viewport = getExportViewport(diagram);

  inlineComputedStyles(source, clone);

  clone.setAttribute('xmlns', SVG_NAMESPACE);
  clone.setAttribute('viewBox', `${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`);
  clone.setAttribute('width', String(viewport.width));
  clone.setAttribute('height', String(viewport.height));

  clone.querySelector('#diagram-world')?.setAttribute('transform', '');

  clone.querySelector('[data-canvas-grid]')?.remove();
  clone.querySelectorAll('[data-export-exclude]').forEach((element) => {
    element.remove();
  });

  const background = document.createElementNS(SVG_NAMESPACE, 'rect');

  background.setAttribute('x', String(viewport.x));
  background.setAttribute('y', String(viewport.y));
  background.setAttribute('width', String(viewport.width));
  background.setAttribute('height', String(viewport.height));
  background.setAttribute('fill', '#ffffff');

  clone.insertBefore(background, clone.firstChild);

  return { clone, viewport };
}

function drawWatermark(
  context: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const width = canvasWidth * WATERMARK_WIDTH_RATIO;
  const height = width * (logo.height / logo.width);

  context.save();
  context.globalAlpha = WATERMARK_OPACITY;
  context.drawImage(
    logo,
    canvasWidth - width - WATERMARK_MARGIN,
    canvasHeight - height - WATERMARK_MARGIN,
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
  const { clone, viewport } = prepareExportSvg(svg, diagram);
  const image = await renderSvgImage(clone);

  const canvas = document.createElement('canvas');

  canvas.width = Math.max(Math.round(viewport.width * EXPORT_SCALE), 1);
  canvas.height = Math.max(Math.round(viewport.height * EXPORT_SCALE), 1);

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No se pudo obtener el contexto 2D del canvas');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  try {
    const logo = await loadImage(BRANDING.logo);

    drawWatermark(context, logo, canvas.width, canvas.height);
  } catch {
    // La exportación sigue funcionando aunque la marca de agua no cargue.
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
