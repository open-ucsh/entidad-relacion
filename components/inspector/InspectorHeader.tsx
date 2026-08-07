import { INSPECTOR_TYPE_CONFIG } from './inspector-config';

import type { Attribute, Entity, Isa, Relationship } from '@/domain/models';

type InspectorElement = Entity | Relationship | Attribute | Isa;

interface InspectorHeaderProps {
  element: InspectorElement;
}

export function InspectorHeader({ element }: InspectorHeaderProps) {
  const config = INSPECTOR_TYPE_CONFIG[element.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 border-b border-border pb-5">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${config.bg} ${config.ring}`}
      >
        <Icon size={19} strokeWidth={2} className={config.text} />
      </div>

      <div className="min-w-0 pt-0.5">
        <p className={`text-xs font-semibold uppercase tracking-wider ${config.text}`}>
          {config.label}
        </p>

        <h3 className="truncate text-base font-semibold text-text" title={element.name}>
          {element.name}
        </h3>
      </div>
    </div>
  );
}
