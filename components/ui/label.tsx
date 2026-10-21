import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-xs font-semibold text-zinc-700 select-none flex items-center gap-1',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-rose-500 font-bold">*</span>}
    </label>
  );
}
