'use client';

import { useRef } from 'react';

import { useDiagramStore } from '@/state/diagram/diagram.store';

import { Canvas } from './canvas/Canvas';
import { useCanvasExport } from './canvas/hooks/useCanvasExport';
import { EditorPanelToggle } from './EditorPanelToggle';
import { Header } from './header/Header';
import { useEditorPanels } from './hooks/useEditorPanels';
import { Inspector } from './inspector/Inspector';
import { Toolbar } from './toolbar/Toolbar';

export function Editor() {
  const diagram = useDiagramStore((state) => state.diagram);
  const resetDiagram = useDiagramStore((state) => state.resetDiagram);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const { exportDiagram } = useCanvasExport(svgRef);

  const { isToolbarOpen, isInspectorOpen, workspaceColumns, toggleToolbar, toggleInspector } =
    useEditorPanels();

  function handleNewDiagram() {
    const shouldReset = window.confirm(
      'Se eliminarán los elementos actuales del diagrama. ¿Deseas continuar?',
    );

    if (shouldReset) {
      resetDiagram();
    }
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <Header
        onNewDiagram={handleNewDiagram}
        onExport={(format) => {
          void exportDiagram(format);
        }}
      />

      <main className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className="grid h-full min-h-0 min-w-0 overflow-hidden transition-[grid-template-columns] duration-200 ease-out"
          style={{ gridTemplateColumns: workspaceColumns }}
        >
          <div
            className={`h-full min-h-0 min-w-0 overflow-hidden transition-opacity duration-150 ${
              isToolbarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <Toolbar />
          </div>

          <div className="relative h-full min-h-0 min-w-0 overflow-hidden">
            <Canvas diagram={diagram} svgRef={svgRef} />
          </div>

          <div
            className={`h-full min-h-0 min-w-0 overflow-hidden transition-opacity duration-150 ${
              isInspectorOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <Inspector />
          </div>
        </div>

        <EditorPanelToggle side="left" isOpen={isToolbarOpen} onToggle={toggleToolbar} />

        <EditorPanelToggle side="right" isOpen={isInspectorOpen} onToggle={toggleInspector} />
      </main>
    </div>
  );
}
