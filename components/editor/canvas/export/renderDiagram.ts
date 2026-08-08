import { BRANDING } from '@/config/branding';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const EXPORT_SCALE = 2;
const WATERMARK_WIDTH_RATIO = 0.16;
const WATERMARK_MARGIN = 16 * EXPORT_SCALE;
const WATERMARK_OPACITY = 0.55;

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
  const clone = svg.cloneNode(true) as SVGSVGElement;

  inlineComputedStyles(svg, clone);

  clone.setAttribute('xmlns', SVG_NAMESPACE);

  const background = document.createElementNS(SVG_NAMESPACE, 'rect');

  background.setAttribute('width', '100%');
  background.setAttribute('height', '100%');
  background.setAttribute('fill', '#ffffff');

  clone.insertBefore(background, clone.firstChild);

  const serializedSvg = new XMLSerializer().serializeToString(clone);
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

export async function renderDiagramToCanvas(svg: SVGSVGElement): Promise<HTMLCanvasElement> {
  const bounds = svg.getBoundingClientRect();
  const width = Math.max(Math.round(bounds.width), 1);
  const height = Math.max(Math.round(bounds.height), 1);

  const image = await renderSvgImage(svg);

  const canvas = document.createElement('canvas');
  canvas.width = width * EXPORT_SCALE;
  canvas.height = height * EXPORT_SCALE;

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
