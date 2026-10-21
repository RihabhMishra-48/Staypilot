'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-lg border bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors duration-150',
          'border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500',
          'disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500',
          error && 'border-rose-500 focus-visible:ring-rose-500 focus-visible:border-rose-500',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
