'use client';

import type { ReactNode } from 'react';

interface CanvasInteractionProps {
  children: ReactNode;
  onBackgroundClick: () => void;
}

/**
 * Envuelve el contenido interactivo del canvas (grilla + elementos).
 * No corta la propagación del pointerdown: necesita seguir subiendo
 * hasta el <svg> para que startPan() pueda iniciar el arrastre del
 * fondo. Los elementos que sí consumen el clic (formas del diagrama)
 * cortan su propia propagación en CanvasLayers antes de llegar acá.
 */
export function CanvasInteraction({ children, onBackgroundClick }: CanvasInteractionProps) {
  function handleBackgroundClick() {
    onBackgroundClick();
  }

  return <g onClick={handleBackgroundClick}>{children}</g>;
}
