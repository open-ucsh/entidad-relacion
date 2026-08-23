'use client';

import { useRef, useState } from 'react';

import { selectActiveDiagram, selectCanRedo, selectCanUndo } from '@/state/diagram/selectors';
import { useDiagramStore } from '@/state/diagram/store';

import { Canvas } from './canvas/Canvas';
import { useCanvasExport } from './canvas/hooks/useCanvasExport';
import { DocumentGallery } from './documents/DocumentGallery';
import { EditorSidePanelToggle } from './EditorSidePanelToggle';
import { Header } from './header/Header';
import { KeyboardShortcutsDialog } from './header/KeyboardShortcutsDialog';
import { useDiagramFile } from './hooks/useDiagramFile';
import { useEditorPanels } from './hooks/useEditorPanels';
import { EditorRightPanel, type RightPanelTab } from './right-panel/EditorRightPanel';
import { Toolbar } from './toolbar/Toolbar';
import { EditorFeedbackProvider } from './feedback/EditorFeedbackProvider';

export function Editor() {
  const diagram = useDiagramStore(selectActiveDiagram);

  const setDiagramName = useDiagramStore((state) => state.setDiagramName);
  const importDiagram = useDiagramStore((state) => state.importDiagram);

  const undo = useDiagramStore((state) => state.undo);
  const redo = useDiagramStore((state) => state.redo);

  const appearance = useDiagramStore((state) => state.appearance);

  const canUndo = useDiagramStore(selectCanUndo);
  const canRedo = useDiagramStore(selectCanRedo);

  const [activeRightPanel, setActiveRightPanel] = useState<RightPanelTab>('inspector');
  const [isDocumentGalleryOpen, setIsDocumentGalleryOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const { exportDiagram } = useCanvasExport(svgRef, diagram);

  const { exportJson, importJson } = useDiagramFile({
    diagram,
    appearance,
    onImportDiagram: importDiagram,
  });

  const {
    isToolbarOpen,
    isInspectorOpen,
    workspaceColumns,
    toggleToolbar,
    toggleInspector,
    openInspector,
  } = useEditorPanels();

  function handleOpenHistory() {
    openInspector();
    setActiveRightPanel('history');
  }

  return (
    <EditorFeedbackProvider>
      <div className="flex h-full min-h-0 flex-col">
        <Header
          diagramName={diagram.metadata.name}
          canUndo={canUndo}
          canRedo={canRedo}
          onRenameDiagram={setDiagramName}
          onUndo={undo}
          onRedo={redo}
          onOpenHistory={handleOpenHistory}
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
              <EditorRightPanel activeTab={activeRightPanel} onChangeTab={setActiveRightPanel} />
            </div>
          </div>

          <EditorSidePanelToggle side="left" isOpen={isToolbarOpen} onToggle={toggleToolbar} />

          <EditorSidePanelToggle side="right" isOpen={isInspectorOpen} onToggle={toggleInspector} />
        </main>

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
    </EditorFeedbackProvider>
  );
}
