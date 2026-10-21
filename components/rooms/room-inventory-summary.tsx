import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RoomInventoryMetrics } from '@/types';
import { BedDouble, CheckCircle2, Sparkles, Wrench, Layers } from 'lucide-react';

interface RoomInventorySummaryProps {
  metrics: RoomInventoryMetrics;
}

export function RoomInventorySummary({ metrics }: RoomInventorySummaryProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Total Physical Rooms */}
      <Card className="border-zinc-200/90 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <span>Total Rooms</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <BedDouble className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">
              {metrics.totalRooms}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">units</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 leading-tight">
            Registered physical units
          </p>
        </CardContent>
      </Card>

      {/* 2. Available for Guests */}
      <Card className="border-zinc-200/90 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <span>Ready / Clean</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-emerald-700">
              {metrics.availableRooms}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">available</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 leading-tight">
            Operational and ready
          </p>
        </CardContent>
      </Card>

      {/* 3. Housekeeping Queue */}
      <Card className="border-zinc-200/90 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 uppercase tracking-wider">
            <span>Housekeeping</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-amber-900">
              {metrics.cleaningRooms + metrics.dirtyRooms}
            </span>
            <span className="text-[11px] text-amber-700 font-mono">
              {metrics.dirtyRooms} dirty / {metrics.cleaningRooms} clean
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 leading-tight">
            Turnover in progress
          </p>
        </CardContent>
      </Card>

      {/* 4. Maintenance & Out of Service */}
      <Card className="border-zinc-200/90 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700 uppercase tracking-wider">
            <span>Maintenance</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-rose-800">
              {metrics.maintenanceRooms + metrics.outOfServiceRooms}
            </span>
            <span className="text-[11px] text-rose-600 font-mono">
              {metrics.maintenanceRooms} maint / {metrics.outOfServiceRooms} OOS
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 leading-tight">
            Non-sellable / repair
          </p>
        </CardContent>
      </Card>

      {/* 5. Room Categories */}
      <Card className="border-zinc-200/90 shadow-2xs col-span-2 lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <span>Room Types</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-blue-900">
              {metrics.activeRoomTypes}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              of {metrics.totalRoomTypes} active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 leading-tight">
            Configured categories
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
