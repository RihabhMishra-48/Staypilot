import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon: React.ComponentType<{ className?: string }>;
  badgeText?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  badgeText,
}: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden border-zinc-200/90 shadow-2xs hover:shadow-xs transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {title}
          </span>
          <div className="flex items-center gap-1.5">
            {badgeText && (
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200">
                {badgeText}
              </span>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                'text-xs font-semibold flex items-center',
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-1 text-[11px] text-zinc-500 leading-tight">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
