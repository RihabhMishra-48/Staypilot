'use client';

import * as React from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog Box */}
      <div className="relative z-50 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-zinc-200 transition-all sm:scale-100 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-3">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 leading-tight">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-xs text-zinc-500 leading-normal">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="py-3 text-sm text-zinc-600">{children}</div>

        {footer && (
          <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
