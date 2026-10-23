import { Plus } from 'lucide-react';

import type {
  AttributeKeyType,
  Diagram,
  DiagramElement,
  EntityKind,
  RelationshipKind,
} from '@/domain/diagram/models';
import { getAttributeChildren } from '@/domain/diagram/queries/attributes';
import { getIsaHierarchy } from '@/domain/diagram/queries/isa';

import type { ElementColor } from '@/state/diagram/diagram-appearance';

import { ColorPicker, SegmentedControl, SwitchControl } from './InspectorControls';
import { InspectorField } from './InspectorField';
import { IsaHierarchySummary } from './IsaHierarchySummary';

const ENTITY_OPTIONS = [
  { label: 'Regular', value: 'regular' },
  { label: 'Débil', value: 'weak' },
  { label: 'Asociativa', value: 'associative' },
] satisfies ReadonlyArray<{
  label: string;
  value: EntityKind;
}>;

const ATTRIBUTE_KEY_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Primaria', value: 'primary' },
  { label: 'Parcial', value: 'partial' },
] satisfies ReadonlyArray<{
  label: string;
  value: AttributeKeyType;
}>;

const RELATIONSHIP_KIND_OPTIONS = [
  { label: 'Regular', value: 'regular' },
  { label: 'Identificadora', value: 'identifying' },
] satisfies ReadonlyArray<{
  label: string;
  value: RelationshipKind;
}>;

interface InspectorElementContentProps {
  diagram: Diagram;
  element: DiagramElement;
  color: ElementColor;
  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
  setElementColor: (id: string, color: ElementColor) => void;
  onAddAttribute: (parentId: string) => void;
}

interface AddAttributeButtonProps {
  parentId: string;
  onAddAttribute: (parentId: string) => void;
  label?: string;
}

function AddAttributeButton({
  parentId,
  onAddAttribute,
  label = 'Agregar atributo',
}: AddAttributeButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        onAddAttribute(parentId);
      }}
      className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-xs font-medium text-brand-primary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    >
      <Plus size={16} aria-hidden="true" />
      {label}
    </button>
  );
}

function AppearanceControls({
  element,
  color,
  setElementColor,
}: Pick<InspectorElementContentProps, 'element' | 'color' | 'setElementColor'>) {
  return (
    <InspectorField label="Color">
      <ColorPicker
        value={color}
        onChange={(nextColor) => {
          setElementColor(element.id, nextColor);
        }}
      />
    </InspectorField>
  );
}

export function InspectorElementContent({
  diagram,
  element,
  color,
  updateElement,
  setElementColor,
  onAddAttribute,
}: InspectorElementContentProps) {
  if (element.type === 'entity') {
    return (
      <>
        <InspectorField label="Tipo de entidad">
          <SegmentedControl
            value={element.kind}
            options={ENTITY_OPTIONS}
            onChange={(kind) => {
              updateElement(element.id, { kind });
            }}
          />
        </InspectorField>

        {element.kind === 'weak' && (
          <p className="rounded-md border border-border bg-surface px-3 py-2 text-xs leading-5 text-text-muted">
            Una entidad débil se identifica mediante la clave de su propietario y una clave parcial.
            Conéctala a su propietario mediante una relación identificadora.
          </p>
        )}

        <AppearanceControls element={element} color={color} setElementColor={setElementColor} />

        <AddAttributeButton parentId={element.id} onAddAttribute={onAddAttribute} />
      </>
    );
  }

  if (element.type === 'attribute') {
    const children = getAttributeChildren(diagram, element.id);

    return (
      <>
        <InspectorField label="Tipo de clave">
          <SegmentedControl
            value={element.keyType}
            options={ATTRIBUTE_KEY_OPTIONS}
            onChange={(keyType) => {
              updateElement(element.id, { keyType });
            }}
          />
        </InspectorField>

        {element.keyType === 'partial' && (
          <p className="rounded-md border border-border bg-surface px-3 py-2 text-xs leading-5 text-text-muted">
            La clave parcial distingue las instancias de una entidad débil dentro de un mismo
            propietario.
          </p>
        )}

        <InspectorField label="Propiedades">
          <div className="grid grid-cols-2 gap-2">
            <SwitchControl
              checked={element.unique}
              label="Único"
              onChange={(unique) => {
                updateElement(element.id, { unique });
              }}
            />

            <SwitchControl
              checked={element.multivalued}
              label="Multivaluado"
              onChange={(multivalued) => {
                updateElement(element.id, { multivalued });
              }}
            />

            <SwitchControl
              checked={element.optional}
              label="Opcional"
              onChange={(optional) => {
                updateElement(element.id, { optional });
              }}
            />

            <SwitchControl
              checked={element.composite}
              label="Compuesto"
              disabled={children.length > 0}
              onChange={(composite) => {
                updateElement(element.id, { composite });
              }}
            />

            <SwitchControl
              checked={element.derived}
              label="Derivado"
              onChange={(derived) => {
                updateElement(element.id, { derived });
              }}
            />
          </div>
        </InspectorField>

        {element.derived && (
          <p className="rounded-md border border-border bg-surface px-3 py-2 text-xs leading-5 text-text-muted">
            Un atributo derivado se calcula a partir de otros datos. Se representa con una elipse
            discontinua y no se almacena como columna en la transformación actual.
          </p>
        )}

        {element.multivalued && (
          <p className="rounded-md border border-border bg-surface px-3 py-2 text-xs leading-5 text-text-muted">
            Un atributo multivaluado permite varios valores para una misma instancia y se representa
            con una doble elipse.
          </p>
        )}

        {element.composite && (
          <InspectorField label="Componentes">
            {children.length > 0 ? (
              <>
                <ul className="space-y-1">
                  {children.map((child) => (
                    <li
                      key={child.id}
                      className="rounded-md border border-border bg-surface px-3 py-2 text-xs text-text"
                    >
                      {child.name}
                    </li>
                  ))}
                </ul>

                <p className="text-xs leading-5 text-text-muted">
                  Elimina las conexiones con los componentes antes de desactivar la propiedad de
                  atributo compuesto.
                </p>
              </>
            ) : (
              <p className="text-xs leading-5 text-text-muted">
                Agrega sus componentes. Por ejemplo, «Dirección» puede contener «Calle», «Número» y
                «Comuna».
              </p>
            )}

            <AddAttributeButton
              parentId={element.id}
              onAddAttribute={onAddAttribute}
              label="Agregar componente"
            />
          </InspectorField>
        )}

        <AppearanceControls element={element} color={color} setElementColor={setElementColor} />
      </>
    );
  }

  if (element.type === 'relationship') {
    return (
      <>
        <InspectorField label="Tipo de relación">
          <SegmentedControl
            value={element.kind}
            options={RELATIONSHIP_KIND_OPTIONS}
            onChange={(kind) => {
              updateElement(element.id, { kind });
            }}
          />
        </InspectorField>

        {element.kind === 'identifying' && (
          <p className="rounded-md border border-border bg-surface px-3 py-2 text-xs leading-5 text-text-muted">
            Una relación identificadora vincula una entidad débil con su propietario. La clave del
            propietario forma parte de la clave primaria de la entidad débil.
          </p>
        )}

        <AppearanceControls element={element} color={color} setElementColor={setElementColor} />

        <AddAttributeButton parentId={element.id} onAddAttribute={onAddAttribute} />
      </>
    );
  }

  return (
    <>
      <IsaHierarchySummary hierarchy={getIsaHierarchy(diagram, element)} />

      <AppearanceControls element={element} color={color} setElementColor={setElementColor} />
    </>
  );
}
