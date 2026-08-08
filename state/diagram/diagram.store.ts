import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/domain/diagram/lib/id';
import type { Diagram, DiagramActivityType } from '@/domain/diagram/models';
import { findDiagramElement } from '@/domain/diagram/queries/elements';

import { createInitialDiagram } from './diagram.initial';
import {
  moveDiagramElements,
  removeDiagramElements,
  updateDiagram,
  updateDiagramConnection,
} from './diagram.mutations';
import type { DiagramState } from './diagram.types';

function appendActivity(diagram: Diagram, type: DiagramActivityType, details: string): Diagram {
  const occurredAt = new Date().toISOString();

  return {
    ...diagram,
    metadata: {
      ...diagram.metadata,
      updatedAt: occurredAt,
    },
    activity: [
      ...diagram.activity,
      {
        id: createId('activity'),
        type,
        occurredAt,
        details,
      },
    ],
  };
}

export const useDiagramStore = create<DiagramState>()(
  persist(
    (set, get) => ({
      diagram: createInitialDiagram(),
      selectedElementId: null,
      selectedElementIds: [],
      connectionSourceId: null,
      activeTool: 'select',

      setDiagram: (diagram) => {
        set({
          diagram,
          selectedElementId: null,
          selectedElementIds: [],
          connectionSourceId: null,
        });
      },

      importDiagram: (diagram) => {
        const importedAt = new Date().toISOString();

        set({
          diagram: {
            ...diagram,
            metadata: {
              ...diagram.metadata,
              name: diagram.metadata.name || 'Diagrama importado',
              origin: 'imported',
              importedAt,
              updatedAt: importedAt,
            },
            activity: [
              ...diagram.activity,
              {
                id: createId('activity'),
                type: 'diagram-imported',
                occurredAt: importedAt,
                details: 'Se importó un proyecto JSON en ER Designer.',
              },
            ],
          },
          selectedElementId: null,
          selectedElementIds: [],
          connectionSourceId: null,
          activeTool: 'select',
        });
      },

      resetDiagram: () => {
        set({
          diagram: createInitialDiagram(),
          selectedElementId: null,
          selectedElementIds: [],
          connectionSourceId: null,
          activeTool: 'select',
        });
      },

      setDiagramName: (name) => {
        const trimmedName = name.trim();

        if (!trimmedName) {
          return;
        }

        set((state) => {
          if (state.diagram.metadata.name === trimmedName) {
            return state;
          }

          return {
            diagram: appendActivity(
              {
                ...state.diagram,
                metadata: {
                  ...state.diagram.metadata,
                  name: trimmedName,
                },
              },
              'diagram-renamed',
              `Se renombró el proyecto a “${trimmedName}”.`,
            ),
          };
        });
      },

      setSelectedElement: (id) => {
        set({
          selectedElementId: id,
          selectedElementIds: id ? [id] : [],
        });
      },

      toggleSelectedElement: (id) => {
        set((state) => {
          const isSelected = state.selectedElementIds.includes(id);

          const selectedElementIds = isSelected
            ? state.selectedElementIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedElementIds, id];

          return {
            selectedElementIds,
            selectedElementId: isSelected ? (selectedElementIds.at(-1) ?? null) : id,
          };
        });
      },

      selectAllElements: () => {
        set((state) => {
          const selectedElementIds = [
            ...state.diagram.entities.map((element) => element.id),
            ...state.diagram.relationships.map((element) => element.id),
            ...state.diagram.attributes.map((element) => element.id),
          ];

          return {
            selectedElementIds,
            selectedElementId: selectedElementIds.at(-1) ?? null,
          };
        });
      },

      clearSelection: () => {
        set({
          selectedElementId: null,
          selectedElementIds: [],
        });
      },

      setActiveTool: (activeTool) => {
        set({
          activeTool,
          connectionSourceId: null,
        });
      },

      addEntity: (entity) => {
        set((state) => ({
          diagram: appendActivity(
            {
              ...state.diagram,
              entities: [...state.diagram.entities, entity],
            },
            'element-created',
            `Se creó la entidad “${entity.name}”.`,
          ),
        }));
      },

      addRelationship: (relationship) => {
        set((state) => ({
          diagram: appendActivity(
            {
              ...state.diagram,
              relationships: [...state.diagram.relationships, relationship],
            },
            'element-created',
            `Se creó la relación “${relationship.name}”.`,
          ),
        }));
      },

      addAttribute: (attribute) => {
        set((state) => ({
          diagram: appendActivity(
            {
              ...state.diagram,
              attributes: [...state.diagram.attributes, attribute],
            },
            'element-created',
            `Se creó el atributo “${attribute.name}”.`,
          ),
        }));
      },

      addConnection: (connection) => {
        set((state) => ({
          diagram: appendActivity(
            {
              ...state.diagram,
              connections: [...state.diagram.connections, connection],
            },
            'connection-created',
            'Se creó una conexión.',
          ),
        }));
      },

      updateElement: (id, updates) => {
        set((state) => {
          const element = findDiagramElement(state.diagram, id);
          const diagram = updateDiagram(state.diagram, id, updates);

          const details =
            typeof updates.name === 'string' && element
              ? `Se renombró “${element.name}” a “${updates.name}”.`
              : 'Se actualizaron las propiedades de un elemento.';

          return {
            diagram: appendActivity(
              diagram,
              typeof updates.name === 'string' ? 'element-renamed' : 'element-updated',
              details,
            ),
          };
        });
      },

      updateConnection: (id, updates) => {
        set((state) => ({
          diagram: appendActivity(
            updateDiagramConnection(state.diagram, id, updates),
            'connection-updated',
            'Se actualizó la cardinalidad de una conexión.',
          ),
        }));
      },

      moveElements: (updates) => {
        if (updates.length === 0) {
          return;
        }

        set((state) => ({
          diagram: moveDiagramElements(state.diagram, updates),
        }));
      },

      removeElement: (id) => {
        get().removeElements([id]);
      },

      removeElements: (ids) => {
        if (ids.length === 0) {
          return;
        }

        const removedIds = new Set(ids);

        set((state) => {
          const selectedElementIds = state.selectedElementIds.filter((id) => !removedIds.has(id));

          return {
            diagram: appendActivity(
              removeDiagramElements(state.diagram, ids),
              'elements-removed',
              `Se eliminaron ${ids.length} elemento${ids.length === 1 ? '' : 's'}.`,
            ),
            selectedElementIds,
            selectedElementId: selectedElementIds.at(-1) ?? null,
            connectionSourceId:
              state.connectionSourceId && removedIds.has(state.connectionSourceId)
                ? null
                : state.connectionSourceId,
          };
        });
      },

      recordActivity: (type, details) => {
        set((state) => ({
          diagram: appendActivity(state.diagram, type, details),
        }));
      },

      handleConnectClick: (id) => {
        const { addConnection, connectionSourceId, diagram } = get();

        if (!connectionSourceId) {
          set({ connectionSourceId: id });
          return;
        }

        if (connectionSourceId === id) {
          set({ connectionSourceId: null });
          return;
        }

        const alreadyExists = diagram.connections.some(
          (connection) =>
            (connection.fromId === connectionSourceId && connection.toId === id) ||
            (connection.fromId === id && connection.toId === connectionSourceId),
        );

        if (!alreadyExists) {
          addConnection({
            id: createId('connection'),
            type: 'connection',
            fromId: connectionSourceId,
            toId: id,
            minimum: 'unspecified',
            maximum: 'unspecified',
          });
        }

        set({ connectionSourceId: null });
      },
    }),
    {
      name: 'er-designer-active-project',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        diagram: state.diagram,
      }),
    },
  ),
);
