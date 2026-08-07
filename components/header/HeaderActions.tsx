import { FilePlus, ImageDown } from 'lucide-react';

function ActionButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
    >
      <Icon size={14} strokeWidth={1.75} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ActionButton icon={FilePlus} label="Nuevo" />
      <div className="mx-1 hidden h-6 w-px bg-white/15 sm:block" aria-hidden />
      <ActionButton icon={ImageDown} label="Exportar PNG" />
    </div>
  );
}
