import React from 'react';
import { cn } from '../lib/utils';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-blue text-white hover:bg-brand-blue/90 shadow-sm',
      outline: 'border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/5',
      ghost: 'text-gray-600 hover:text-brand-blue hover:bg-gray-50',
    };
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg font-bold',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-button font-semibold transition-all active:scale-[0.98] disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
