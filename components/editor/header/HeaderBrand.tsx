import Image from 'next/image';

import { BRANDING } from '@/config/branding';

export function HeaderBrand() {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <Image
        src={BRANDING.logo}
        alt={BRANDING.university}
        width={56}
        height={56}
        priority
        className="h-10 w-auto object-contain"
      />
    </div>
  );
}
