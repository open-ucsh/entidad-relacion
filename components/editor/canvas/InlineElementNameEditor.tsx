import type { DiagramElement } from '@/domain/diagram/models';

interface InlineElementNameEditorProps {
  element: DiagramElement;
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export function InlineElementNameEditor({
  element,
  value,
  onChange,
  onCommit,
  onCancel,
}: InlineElementNameEditorProps) {
  return (
    <foreignObject x={element.position.x - 58} y={element.position.y - 17} width="116" height="34">
      <input
        autoFocus
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }

          if (event.key === 'Escape') {
            onCancel();
          }
        }}
        onBlur={onCommit}
        className="h-full w-full rounded border border-brand-primary bg-background px-2 text-center text-xs font-semibold text-text outline-none"
      />
    </foreignObject>
  );
}
