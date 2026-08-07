import { Canvas } from '@/components/canvas/Canvas';
import { Header } from '@/components/header/Header';
import { Inspector } from '@/components/inspector/Inspector';
import { Toolbar } from '@/components/toolbar/Toolbar';

export function Editor() {
  return (
    <main className="flex h-screen flex-col bg-background">
      <Header />

      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr_320px]">
        <Toolbar />

        <Canvas />

        <Inspector />
      </div>
    </main>
  );
}
