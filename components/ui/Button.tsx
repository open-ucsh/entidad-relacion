import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover border-brand-primary',
  secondary: 'bg-background text-text border-border hover:bg-surface-hover',
};

export function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        variants[variant],
        className,
      ].join(' ')}
      {...props}
    />
  );
}
