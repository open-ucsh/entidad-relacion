'use client';

import { useRef, useState } from 'react';

import { useDiagramStore } from '@/state/diagram/diagram.store';

import { Canvas } from './canvas/Canvas';
import { useCanvasExport } from './canvas/hooks/useCanvasExport';
import { EditorPanelToggle } from './EditorPanelToggle';
import { Header } from './header/Header';
import { HistoryPanel } from './history/HistoryPanel';
import { useDiagramFile } from './hooks/useDiagramFile';
import { useEditorPanels } from './hooks/useEditorPanels';
import { Inspector } from './inspector/Inspector';
import { Toolbar } from './toolbar/Toolbar';

export function Editor() {
  const diagram = useDiagramStore((state) => state.diagram);
  const resetDiagram = useDiagramStore((state) => state.resetDiagram);
  const setDiagramName = useDiagramStore((state) => state.setDiagramName);
  const importDiagram = useDiagramStore((state) => state.importDiagram);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const { exportDiagram } = useCanvasExport(svgRef, diagram);
  const { exportJson, importJson } = useDiagramFile({
    diagram,
    onImportDiagram: importDiagram,
  });

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
    <div className="flex h-full min-h-0 flex-col">
      <Header
        diagramName={diagram.metadata.name}
        onRenameDiagram={setDiagramName}
        onNewDiagram={handleNewDiagram}
        onOpenHistory={() => {
          setIsHistoryOpen(true);
        }}
        onExport={(format) => {
          void exportDiagram(format);
        }}
        onExportJson={exportJson}
        onImportJson={importJson}
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

      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
        }}
      />
    </div>
  );
}
