import { HeaderActions } from './HeaderActions';
import { HeaderBrand } from './HeaderBrand';

export function Header() {
  return (
    <header className="relative flex h-20 items-center justify-between border-b border-border bg-brand-primary px-5">
      <HeaderBrand />
      <HeaderActions />
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-brand-gold/0 via-brand-gold to-brand-gold/0" />
    </header>
  );
}
