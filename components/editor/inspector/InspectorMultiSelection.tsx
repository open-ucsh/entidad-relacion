import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  BetweenHorizontalEnd,
  BetweenVerticalEnd,
} from 'lucide-react';

import type { ElementAlignment, ElementDistribution } from '@/state/diagram/types';

import { SectionTitle } from './InspectorControls';

interface InspectorMultiSelectionProps {
  count: number;
  onAlign: (alignment: ElementAlignment) => void;
  onDistribute: (distribution: ElementDistribution) => void;
}

interface ActionButtonProps {
  label: string;
  icon: typeof AlignStartVertical;
  onClick: () => void;
  disabled?: boolean;
}

function ActionButton({ label, icon: Icon, onClick, disabled = false }: ActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-10 items-center justify-center rounded-md border border-border bg-background text-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon size={18} strokeWidth={1.8} />
    </button>
  );
}

export function InspectorMultiSelection({
  count,
  onAlign,
  onDistribute,
}: InspectorMultiSelectionProps) {
  const canDistribute = count >= 3;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-base font-semibold text-text">{count} elementos seleccionados</p>

        <p className="mt-1 text-sm leading-6 text-text-muted">Organiza su posición en el lienzo.</p>
      </div>

      <section>
        <SectionTitle>Alinear horizontalmente</SectionTitle>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <ActionButton
            label="Alinear a la izquierda"
            icon={AlignStartVertical}
            onClick={() => {
              onAlign('left');
            }}
          />
          <ActionButton
            label="Alinear al centro"
            icon={AlignCenterVertical}
            onClick={() => {
              onAlign('center');
            }}
          />
          <ActionButton
            label="Alinear a la derecha"
            icon={AlignEndVertical}
            onClick={() => {
              onAlign('right');
            }}
          />
        </div>
      </section>

      <section>
        <SectionTitle>Alinear verticalmente</SectionTitle>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <ActionButton
            label="Alinear arriba"
            icon={AlignStartHorizontal}
            onClick={() => {
              onAlign('top');
            }}
          />
          <ActionButton
            label="Alinear al medio"
            icon={AlignCenterHorizontal}
            onClick={() => {
              onAlign('middle');
            }}
          />
          <ActionButton
            label="Alinear abajo"
            icon={AlignEndHorizontal}
            onClick={() => {
              onAlign('bottom');
            }}
          />
        </div>
      </section>

      <section>
        <SectionTitle>Distribuir</SectionTitle>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <ActionButton
            label="Distribuir horizontalmente"
            icon={BetweenHorizontalEnd}
            disabled={!canDistribute}
            onClick={() => {
              onDistribute('horizontal');
            }}
          />
          <ActionButton
            label="Distribuir verticalmente"
            icon={BetweenVerticalEnd}
            disabled={!canDistribute}
            onClick={() => {
              onDistribute('vertical');
            }}
          />
        </div>

        {!canDistribute && (
          <p className="mt-2 text-xs leading-5 text-text-muted">
            Selecciona al menos 3 elementos para distribuirlos.
          </p>
        )}
      </section>
    </div>
  );
}
