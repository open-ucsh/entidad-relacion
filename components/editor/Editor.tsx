'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';

import { selectActiveDiagram, selectCanRedo, selectCanUndo } from '@/state/diagram/selectors';
import { useDiagramStore } from '@/state/diagram/store';

import { Canvas } from './canvas/Canvas';
import { useCanvasExport } from './canvas/hooks/useCanvasExport';
import { DocumentGallery } from './documents/DocumentGallery';
import styles from './Editor.module.css';
import { EditorFeedbackProvider } from './feedback/EditorFeedbackProvider';
import { HeaderToolbar } from './header/actions/HeaderToolbar';
import { Header } from './header/Header';
import { KeyboardShortcutsDialog } from './header/KeyboardShortcutsDialog';
import { useDiagramFile } from './hooks/useDiagramFile';
import { EditorRightPanel, type RightPanelTab } from './right-panel/EditorRightPanel';
import { MobileToolbar } from './toolbar/MobileToolbar';
import { Toolbar } from './toolbar/Toolbar';

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
  const [isDesktopPanelOpen, setIsDesktopPanelOpen] = useState(true);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [isDocumentGalleryOpen, setIsDocumentGalleryOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const { exportDiagram } = useCanvasExport(svgRef, diagram);

  const { exportJson, importJson } = useDiagramFile({
    diagram,
    appearance,
    onImportDiagram: importDiagram,
  });

  function handleOpenDocuments() {
    setIsDocumentGalleryOpen(true);
  }

  function handleOpenShortcuts() {
    setIsShortcutsOpen(true);
  }

  function handleOpenHistory() {
    setActiveRightPanel('history');
    setIsDesktopPanelOpen(true);
  }

  function handleOpenMobileHistory() {
    setActiveRightPanel('history');
    setIsMobilePanelOpen(true);
  }

  function handleOpenMobileInspector() {
    setActiveRightPanel('inspector');
    setIsMobilePanelOpen(true);
  }

  function handleClosePanel() {
    setIsDesktopPanelOpen(false);
    setIsMobilePanelOpen(false);
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
          onOpenMobileHistory={handleOpenMobileHistory}
          onOpenShortcuts={handleOpenShortcuts}
          onExport={(format) => {
            void exportDiagram(format);
          }}
          onExportJson={exportJson}
          onImportJson={importJson}
          onOpenDocuments={handleOpenDocuments}
        />

        <main className={styles.workspace}>
          <div className={styles.canvasSlot}>
            <Canvas diagram={diagram} svgRef={svgRef} />
          </div>

          <div className={styles.floatingToolbar}>
            <Toolbar />
          </div>

          <div className={styles.panelLauncher}>
            <div className="flex items-center gap-2">
              <HeaderToolbar
                onImportJson={importJson}
                onOpenHistory={handleOpenHistory}
                onOpenDocuments={handleOpenDocuments}
                onOpenShortcuts={handleOpenShortcuts}
              />

              <button
                type="button"
                aria-label={isDesktopPanelOpen ? 'Cerrar propiedades' : 'Abrir propiedades'}
                aria-expanded={isDesktopPanelOpen}
                onClick={() => {
                  setActiveRightPanel('inspector');
                  setIsDesktopPanelOpen((open) => !open);
                }}
                className="flex size-11 items-center justify-center rounded-xl border border-border bg-background text-brand-primary shadow-sm transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                <SlidersHorizontal size={19} aria-hidden="true" />
              </button>
            </div>
          </div>

          {isMobilePanelOpen && (
            <button
              type="button"
              aria-label="Cerrar panel"
              className={styles.mobileBackdrop}
              onClick={handleClosePanel}
            />
          )}

          <div
            className={styles.rightPanelSlot}
            data-desktop-open={isDesktopPanelOpen}
            data-mobile-open={isMobilePanelOpen}
          >
            <EditorRightPanel
              activeTab={activeRightPanel}
              onChangeTab={setActiveRightPanel}
              onClose={handleClosePanel}
            />
          </div>
        </main>

        <MobileToolbar onOpenInspector={handleOpenMobileInspector} />

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
