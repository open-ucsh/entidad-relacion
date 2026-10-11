import Image from 'next/image';
import Link from 'next/link';

import { BRANDING } from '@/config/branding';

export function HeaderBrand() {
  return (
    <Link
      href="/"
      aria-label={BRANDING.university}
      className="flex shrink-0 items-center rounded-md p-1 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
    >
      <Image
        src={BRANDING.favicon}
        alt={BRANDING.university}
        width={48}
        height={48}
        priority
        className="size-12 object-contain"
      />
    </Link>
  );
}
