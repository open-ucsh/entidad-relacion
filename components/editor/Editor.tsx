'use client';

import { useRef, useState } from 'react';

import { selectActiveDiagram, selectCanRedo, selectCanUndo } from '@/state/diagram/selectors';
import { useDiagramStore } from '@/state/diagram/store';

import { Canvas } from './canvas/Canvas';
import { useCanvasExport } from './canvas/hooks/useCanvasExport';
import { DocumentGallery } from './documents/DocumentGallery';
import { EditorPanelToggle } from './EditorPanelToggle';
import { Header } from './header/Header';
import { KeyboardShortcutsDialog } from './header/KeyboardShortcutsDialog';
import { HistoryPanel } from './history/history-panel';
import { useDiagramFile } from './hooks/useDiagramFile';
import { useEditorPanels } from './hooks/useEditorPanels';
import { Inspector } from './inspector/Inspector';
import { Toolbar } from './toolbar/Toolbar';

export function Editor() {
  const diagram = useDiagramStore(selectActiveDiagram);
  const resetDiagram = useDiagramStore((state) => state.resetDiagram);
  const setDiagramName = useDiagramStore((state) => state.setDiagramName);
  const importDiagram = useDiagramStore((state) => state.importDiagram);
  const undo = useDiagramStore((state) => state.undo);
  const redo = useDiagramStore((state) => state.redo);

  const canUndo = useDiagramStore(selectCanUndo);
  const canRedo = useDiagramStore(selectCanRedo);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDocumentGalleryOpen, setIsDocumentGalleryOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

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
        updatedAt={diagram.metadata.updatedAt}
        canUndo={canUndo}
        canRedo={canRedo}
        onRenameDiagram={setDiagramName}
        onNewDiagram={handleNewDiagram}
        onUndo={undo}
        onRedo={redo}
        onOpenHistory={() => {
          setIsHistoryOpen(true);
        }}
        onOpenShortcuts={() => {
          setIsShortcutsOpen(true);
        }}
        onExport={(format) => {
          void exportDiagram(format);
        }}
        onExportJson={exportJson}
        onImportJson={importJson}
        onOpenDocuments={() => {
          setIsDocumentGalleryOpen(true);
        }}
      />

      <main className="relative h-full min-h-0 w-full overflow-hidden">
        <div
          className="grid h-full min-h-0 min-w-0 overflow-hidden transition-all duration-200 ease-out"
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

      <DocumentGallery
        isOpen={isDocumentGalleryOpen}
        onClose={() => {
          setIsDocumentGalleryOpen(false);
        }}
      />

      <KeyboardShortcutsDialog
        isOpen={isShortcutsOpen}
        onClose={() => {
          setIsShortcutsOpen(false);
        }}
      />
    </div>
  );
}
