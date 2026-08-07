import Image from 'next/image';
import { BRANDING } from '@/config/branding';

export function HeaderBrand() {
  return (
    <div className="flex items-center gap-4">
      <Image
        src={BRANDING.logo}
        alt={BRANDING.university}
        width={180}
        height={28}
        priority
        className="h-13 w-auto"
      />

      <div className="hidden h-9 w-px bg-white/15 sm:block" aria-hidden />

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            {BRANDING.applicationName}
          </h1>
        </div>
        <p className="mt-0.5 text-xs font-normal text-white/70">
          Editor de diagramas Entidad–Relación
        </p>
      </div>
    </div>
  );
}
