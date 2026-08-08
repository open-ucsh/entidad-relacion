'use client';

import { useRef, useState } from 'react';

import { useDiagramStore } from '@/state/diagram/diagram.store';

import { Canvas } from './canvas/Canvas';
import { useCanvasExport } from './canvas/hooks/useCanvasExport';
import { DocumentGallery } from './documents/DocumentGallery';
import { EditorPanelToggle } from './EditorPanelToggle';
import { Header } from './header/Header';
import { KeyboardShortcutsDialog } from './header/KeyboardShortcutsDialog';
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
  const undo = useDiagramStore((state) => state.undo);
  const redo = useDiagramStore((state) => state.redo);

  const canUndo = useDiagramStore((state) => {
    const activeDocument = state.documents.find(
      (document) => document.id === state.activeDocumentId,
    );

    return (activeDocument?.history.undoStack.length ?? 0) > 0;
  });

  const canRedo = useDiagramStore((state) => {
    const activeDocument = state.documents.find(
      (document) => document.id === state.activeDocumentId,
    );

    return (activeDocument?.history.redoStack.length ?? 0) > 0;
  });

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
