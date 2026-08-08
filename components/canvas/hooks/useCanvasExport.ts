'use client';

import { useCallback, type RefObject } from 'react';
import { jsPDF } from 'jspdf';

import { BRANDING } from '@/config/branding';

export type ExportFormat = 'png' | 'jpeg' | 'pdf';

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

function inlineComputedStyles(source: SVGSVGElement, clone: SVGSVGElement) {
  const sourceNodes = source.querySelectorAll('*');
  const cloneNodes = clone.querySelectorAll('*');

  sourceNodes.forEach((sourceNode, index) => {
    const cloneNode = cloneNodes[index];

    if (!(cloneNode instanceof SVGElement)) {
      return;
    }

    const computed = window.getComputedStyle(sourceNode);
    let style = '';

    STYLE_PROPERTIES.forEach((property) => {
      const value = computed.getPropertyValue(property);
      if (value) {
        style += `${property}:${value};`;
      }
    });

    if (style) {
      cloneNode.setAttribute('style', style);
    }
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject(new Error(`No se pudo cargar la imagen: ${src}`));
    };
    image.src = src;
  });
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
) {
  const targetWidth = canvasWidth * WATERMARK_WIDTH_RATIO;
  const targetHeight = targetWidth * (logo.height / logo.width);

  const x = canvasWidth - targetWidth - WATERMARK_MARGIN;
  const y = canvasHeight - targetHeight - WATERMARK_MARGIN;

  ctx.save();
  ctx.globalAlpha = WATERMARK_OPACITY;
  ctx.drawImage(logo, x, y, targetWidth, targetHeight);
  ctx.restore();
}

function renderToCanvas(svg: SVGSVGElement): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const { width, height } = svg.getBoundingClientRect();
    const clone = svg.cloneNode(true) as SVGSVGElement;

    inlineComputedStyles(svg, clone);

    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));

    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', '0');
    background.setAttribute('y', '0');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', '#ffffff');
    clone.insertBefore(background, clone.firstChild);

    const svgString = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = width * EXPORT_SCALE;
      canvas.height = height * EXPORT_SCALE;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto 2D del canvas'));
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      loadImage(BRANDING.logo)
        .then((logo) => {
          drawWatermark(ctx, logo, canvas.width, canvas.height);
          resolve(canvas);
        })
        .catch(() => {
          resolve(canvas);
        });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo rasterizar el SVG'));
    };

    image.src = url;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function fileBaseName(): string {
  return BRANDING.applicationName.toLowerCase().replace(/\s+/g, '-');
}

export function useCanvasExport(svgRef: RefObject<SVGSVGElement | null>) {
  const exportDiagram = useCallback(
    async (format: ExportFormat) => {
      const svg = svgRef.current;

      if (!svg) {
        return;
      }

      const canvas = await renderToCanvas(svg);

      if (format === 'pdf') {
        const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';
        const pdf = new jsPDF({ orientation, unit: 'px', format: [canvas.width, canvas.height] });

        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileBaseName()}-diagrama.pdf`);
        return;
      }

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const quality = format === 'jpeg' ? 0.92 : undefined;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return;
          }

          downloadBlob(blob, `${fileBaseName()}-diagrama.${format}`);
        },
        mimeType,
        quality,
      );
    },
    [svgRef],
  );

  return { exportDiagram };
}
