import { useEffect, useRef } from 'react';

import type { Diagram } from '@/domain/diagram/models';

import type { CanvasSize } from './useCanvasCamera';

interface UseFitOnDocumentChangeOptions {
  activeDocumentId: string;
  diagram: Diagram;
  canvasSize: CanvasSize;
  fitToDiagram: (diagram: Diagram) => void;
}

export function useFitOnDocumentChange({
  activeDocumentId,
  diagram,
  canvasSize,
  fitToDiagram,
}: UseFitOnDocumentChangeOptions) {
  const fittedDocumentIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      canvasSize.width <= 1 ||
      canvasSize.height <= 1 ||
      fittedDocumentIdRef.current === activeDocumentId
    ) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      fitToDiagram(diagram);
      fittedDocumentIdRef.current = activeDocumentId;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeDocumentId, diagram, canvasSize.width, canvasSize.height, fitToDiagram]);
}
