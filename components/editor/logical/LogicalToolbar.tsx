'use client';

import { Columns2, Link2, MousePointer2, Table2 } from 'lucide-react';

import { useDiagramStore } from '@/state/diagram/store';

import { useLogicalSelectionStore } from './logical-selection';

interface LogicalToolbarProps {
  onOpenProperties: () => void;
}

export function LogicalToolbar({ onOpenProperties }: LogicalToolbarProps) {
  const tables = useDiagramStore((state) => state.logicalWorkspace.model.tables);
  const addTable = useDiagramStore((state) => state.addLogicalTable);
  const addColumn = useDiagramStore((state) => state.addLogicalColumn);
  const selection = useLogicalSelectionStore((state) => state.selection);
  const setSelection = useLogicalSelectionStore((state) => state.setSelection);

  const tableId =
    selection?.type === 'table'
      ? selection.tableId
      : selection?.type === 'relation'
        ? selection.sourceTableId
        : undefined;

  const selectedTable = tables.find((table) => table.id === tableId);

  function createTable() {
    const previousIds = new Set(tables.map((table) => table.id));
    addTable();

    const created = useDiagramStore
      .getState()
      .logicalWorkspace.model.tables.find((table) => !previousIds.has(table.id));

    if (created) {
      setSelection({ type: 'table', tableId: created.id });
      onOpenProperties();
    }
  }

  function createColumn() {
    if (!selectedTable) return;

    const previousIds = new Set(selectedTable.columns.map((column) => column.id));
    addColumn(selectedTable.id);

    const created = useDiagramStore
      .getState()
      .logicalWorkspace.model.tables.find((table) => table.id === selectedTable.id)
      ?.columns.find((column) => !previousIds.has(column.id));

    if (created) {
      setSelection({
        type: 'table',
        tableId: selectedTable.id,
        columnId: created.id,
      });
      onOpenProperties();
    }
  }

  const actions = [
    { label: 'Tabla', icon: Table2, disabled: false, onClick: createTable },
    { label: 'Columna', icon: Columns2, disabled: !selectedTable, onClick: createColumn },
    {
      label: 'Relación',
      icon: Link2,
      disabled: !selectedTable,
      onClick: () => {
        if (!selectedTable) return;
        setSelection({
          type: 'table',
          tableId: selectedTable.id,
          section: 'relations',
        });
        onOpenProperties();
      },
    },
  ];

  return (
    <nav
      aria-label="Herramientas del modelo lógico"
      className="flex items-center justify-center gap-1 rounded-xl border border-border bg-background p-1.5 shadow-sm"
    >
      <button
        type="button"
        aria-label="Limpiar selección"
        title="Limpiar selección"
        onClick={() => {
          setSelection(null);
        }}
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        <MousePointer2 size={18} aria-hidden="true" />
      </button>
      <span className="mx-1 h-5 border-l border-border" aria-hidden="true" />
      {actions.map(({ label, icon: Icon, disabled, onClick }) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          title={disabled ? 'Selecciona una tabla primero' : label}
          onClick={onClick}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium text-text hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Icon size={16} aria-hidden="true" />
          {label}
        </button>
      ))}
    </nav>
  );
}
