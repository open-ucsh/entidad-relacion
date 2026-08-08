import Image from 'next/image';

import { BRANDING } from '@/config/branding';

export function HeaderBrand() {
  return (
    <div className="flex min-w-0 items-center gap-5">
      <Image
        src={BRANDING.logo}
        alt={BRANDING.university}
        width={64}
        height={36}
        priority
        className="h-9 w-auto object-contain"
      />

      <div className="hidden h-9 w-px bg-white/15 sm:block" aria-hidden="true" />

      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight text-white">
          {BRANDING.applicationName}
        </h1>

        <p className="mt-0.5 text-xs text-white/70">Editor de diagramas Entidad–Relación</p>
      </div>
    </div>
  );
}
