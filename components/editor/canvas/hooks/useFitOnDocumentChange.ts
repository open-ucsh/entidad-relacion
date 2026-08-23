import { useEffect, useRef } from 'react';

import type { Diagram } from '@/domain/diagram/models';

interface UseFitOnDocumentChangeOptions {
  activeDocumentId: string;
  diagram: Diagram;
  fitToDiagram: (diagram: Diagram) => void;
}

export function useFitOnDocumentChange({
  activeDocumentId,
  diagram,
  fitToDiagram,
}: UseFitOnDocumentChangeOptions) {
  const previousDocumentIdRef = useRef(activeDocumentId);

  useEffect(() => {
    if (previousDocumentIdRef.current === activeDocumentId) {
      return;
    }

    previousDocumentIdRef.current = activeDocumentId;

    const frameId = window.requestAnimationFrame(() => {
      fitToDiagram(diagram);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeDocumentId, diagram, fitToDiagram]);
}
