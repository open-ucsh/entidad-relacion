'use client';

import { Canvas } from '@/components/canvas/Canvas';
import { Header } from '@/components/header/Header';
import { Inspector } from '@/components/inspector/Inspector';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { useDiagramStore } from '@/state/diagram-store';

export function Editor() {
  const diagram = useDiagramStore((state) => state.diagram);
  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <Header />

      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr_320px] overflow-hidden">
        <Toolbar />
        <Canvas diagram={diagram} />
        <Inspector />
      </div>
    </main>
  );
}
