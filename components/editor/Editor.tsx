'use client';

import { History, PanelLeft, PanelRight, X } from 'lucide-react';
import { useRef, useState, type CSSProperties } from 'react';

import { selectActiveDiagram, selectCanRedo, selectCanUndo } from '@/state/diagram/selectors';
import { useDiagramStore } from '@/state/diagram/store';

import { Canvas } from './canvas/Canvas';
import { useCanvasExport } from './canvas/hooks/useCanvasExport';
import { DocumentGallery } from './documents/DocumentGallery';
import styles from './Editor.module.css';
import { EditorSidePanelToggle } from './EditorSidePanelToggle';
import { EditorFeedbackProvider } from './feedback/EditorFeedbackProvider';
import { Header } from './header/Header';
import { KeyboardShortcutsDialog } from './header/KeyboardShortcutsDialog';
import { useDiagramFile } from './hooks/useDiagramFile';
import { useEditorPanels } from './hooks/useEditorPanels';
import { EditorRightPanel, type RightPanelTab } from './right-panel/EditorRightPanel';
import { Toolbar } from './toolbar/Toolbar';

type MobilePanel = 'toolbar' | 'inspector' | null;

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

  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);

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

  function handleOpenMobileHistory() {
    setActiveRightPanel('history');
    setMobilePanel('inspector');
  }

  function handleToggleMobilePanel(panel: Exclude<MobilePanel, null>) {
    setMobilePanel((currentPanel) => (currentPanel === panel ? null : panel));
  }

  function handleCloseMobilePanel() {
    setMobilePanel(null);
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
            className={styles.workspace}
            style={
              {
                '--editor-workspace-columns': workspaceColumns,
              } as CSSProperties
            }
          >
            <div
              className={styles.toolbarSlot}
              data-desktop-open={isToolbarOpen}
              data-mobile-open={mobilePanel === 'toolbar'}
            >
              <Toolbar />
            </div>

            <div className={styles.canvasSlot}>
              <Canvas diagram={diagram} svgRef={svgRef} />
            </div>

            <div
              className={styles.rightPanelSlot}
              data-desktop-open={isInspectorOpen}
              data-mobile-open={mobilePanel === 'inspector'}
            >
              <EditorRightPanel activeTab={activeRightPanel} onChangeTab={setActiveRightPanel} />
            </div>
          </div>

          {mobilePanel !== null && (
            <button
              type="button"
              aria-label="Cerrar panel"
              className={styles.mobileBackdrop}
              onClick={handleCloseMobilePanel}
            />
          )}

          <div className={styles.desktopPanelToggles}>
            <EditorSidePanelToggle side="left" isOpen={isToolbarOpen} onToggle={toggleToolbar} />

            <EditorSidePanelToggle
              side="right"
              isOpen={isInspectorOpen}
              onToggle={toggleInspector}
            />
          </div>

          <div className={styles.mobileControls}>
            <button
              type="button"
              aria-label={mobilePanel === 'toolbar' ? 'Cerrar herramientas' : 'Abrir herramientas'}
              aria-expanded={mobilePanel === 'toolbar'}
              className={styles.mobileControlButton}
              onClick={() => {
                handleToggleMobilePanel('toolbar');
              }}
            >
              {mobilePanel === 'toolbar' ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <PanelLeft size={20} aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              aria-label="Abrir historial"
              className={styles.mobileControlButton}
              onClick={handleOpenMobileHistory}
            >
              <History size={20} aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label={mobilePanel === 'inspector' ? 'Cerrar propiedades' : 'Abrir propiedades'}
              aria-expanded={mobilePanel === 'inspector'}
              className={styles.mobileControlButton}
              onClick={() => {
                handleToggleMobilePanel('inspector');
              }}
            >
              {mobilePanel === 'inspector' ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <PanelRight size={20} aria-hidden="true" />
              )}
            </button>
          </div>
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
