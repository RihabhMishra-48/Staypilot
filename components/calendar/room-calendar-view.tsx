'use client';

import * as React from 'react';
import { Room, RoomType } from '@/types';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Wrench,
  Lock,
  Info,
} from 'lucide-react';
import Link from 'next/link';

interface RoomCalendarViewProps {
  rooms: Room[];
  roomTypes: RoomType[];
  currency?: string;
}

export function RoomCalendarView({
  rooms,
  roomTypes,
  currency = 'INR',
}: RoomCalendarViewProps) {
  // Calendar View Range: 7 days or 14 days
  const [daysCount, setDaysCount] = React.useState<7 | 14>(7);

  // Base starting date: defaults to reference date (2026-10-21)
  const [startDate, setStartDate] = React.useState<Date>(() => {
    const d = new Date('2026-10-21T00:00:00');
    return d;
  });

  // Filters
  const [selectedType, setSelectedType] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  // Generate array of date objects
  const dateColumns = React.useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [startDate, daysCount]);

  // Navigate dates
  const handlePrev = () => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() - daysCount);
    setStartDate(d);
  };

  const handleNext = () => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + daysCount);
    setStartDate(d);
  };

  const handleToday = () => {
    setStartDate(new Date('2026-10-21T00:00:00'));
  };

  // Filter rooms
  const activeRooms = React.useMemo(() => {
    return rooms.filter((r) => {
      if (r.is_archived) return false;
      if (selectedType !== 'all' && r.room_type_id !== selectedType) return false;
      if (selectedStatus !== 'all' && r.operational_status !== selectedStatus) return false;
      return true;
    });
  }, [rooms, selectedType, selectedStatus]);

  const renderCellStatus = (room: Room, date: Date) => {
    const status = room.operational_status;
    const isToday = date.toDateString() === new Date('2026-10-21T00:00:00').toDateString();

    switch (status) {
      case 'maintenance':
        return (
          <div className="h-full w-full rounded-md bg-rose-50 border border-rose-200 p-1 flex flex-col justify-center text-[10px] text-rose-800 font-medium">
            <div className="flex items-center gap-1">
              <Wrench className="h-3 w-3 shrink-0" />
              <span className="truncate">Maintenance</span>
            </div>
          </div>
        );
      case 'out_of_service':
        return (
          <div className="h-full w-full rounded-md bg-zinc-100 border border-zinc-200 p-1 flex flex-col justify-center text-[10px] text-zinc-700 font-medium">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3 shrink-0" />
              <span className="truncate">Out of Service</span>
            </div>
          </div>
        );
      case 'cleaning':
        return (
          <div className="h-full w-full rounded-md bg-blue-50 border border-blue-200 p-1 flex flex-col justify-center text-[10px] text-blue-700 font-medium">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span className="truncate">Cleaning</span>
            </div>
          </div>
        );
      case 'dirty':
        return (
          <div className="h-full w-full rounded-md bg-amber-50 border border-amber-200 p-1 flex flex-col justify-center text-[10px] text-amber-800 font-medium">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span className="truncate">Turnover Req.</span>
            </div>
          </div>
        );
      case 'available':
      default:
        return (
          <div
            className={`h-full w-full rounded-md p-1 flex flex-col justify-center text-[10px] transition-colors border ${
              isToday
                ? 'bg-emerald-50/90 text-emerald-800 border-emerald-300 font-medium'
                : 'bg-zinc-50/50 hover:bg-emerald-50/50 text-zinc-600 border-zinc-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-emerald-700 font-semibold">
                {room.room_type?.base_rate
                  ? formatCurrency(room.room_type.base_rate, currency)
                  : 'Open'}
              </span>
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Tape Chart Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200/90 shadow-2xs">
        {/* Left: Date Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday} className="text-xs">
            Today
          </Button>

          <div className="flex items-center rounded-lg border border-zinc-200 bg-white">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-l-lg transition-colors"
              title="Previous Range"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="px-3 py-1 text-xs font-semibold text-zinc-800 flex items-center gap-1.5 border-x border-zinc-200">
              <CalendarIcon className="h-3.5 w-3.5 text-blue-600" />
              <span>
                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
                {dateColumns[dateColumns.length - 1]?.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-r-lg transition-colors"
              title="Next Range"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* View Span Selector */}
          <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-50 text-xs">
            <button
              type="button"
              onClick={() => setDaysCount(7)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                daysCount === 7
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setDaysCount(14)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                daysCount === 14
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              14 Days
            </button>
          </div>
        </div>

        {/* Right: Filters & Legend */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Room Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="all">All Room Types</option>
            {roomTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Operational Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available Only</option>
            <option value="cleaning">Cleaning</option>
            <option value="dirty">Dirty</option>
            <option value="maintenance">Maintenance</option>
            <option value="out_of_service">Out of Service</option>
          </select>
        </div>
      </div>

      {/* Honest Architectural Status Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-bold">Phase 2 Room &amp; Inventory Status Grid</span>
          <p className="text-[11px] text-blue-800">
            This tape chart reflects live physical room inventory and operational cleanliness from your database. In accordance with StayPilot architectural integrity, guest reservation blocks will activate in <strong>Phase 3</strong> when the concurrency-safe booking engine is connected. Rooms are never fabricated as booked without verified database records.
          </p>
        </div>
      </div>

      {/* Calendar Grid Table */}
      <div className="rounded-xl border border-zinc-200/90 bg-white shadow-2xs overflow-hidden">
        {activeRooms.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-2 border border-blue-200">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-zinc-900">
              {rooms.length === 0
                ? 'No physical rooms registered in this property'
                : 'No rooms match your filter criteria'}
            </h4>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
              {rooms.length === 0
                ? 'Register your room inventory in the Rooms & Inventory module to generate the operational calendar.'
                : 'Try clearing your room type or operational status filters.'}
            </p>
            {rooms.length === 0 && (
              <Link href="/dashboard/rooms">
                <Button variant="primary" size="sm" className="mt-4 text-xs">
                  Go to Rooms &amp; Inventory
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/90 text-zinc-600 font-semibold">
                  <th scope="col" className="p-3 w-48 sticky left-0 bg-zinc-50 z-10 border-r border-zinc-200">
                    Room / Type
                  </th>
                  {dateColumns.map((colDate) => {
                    const isToday =
                      colDate.toDateString() === new Date('2026-10-21T00:00:00').toDateString();
                    return (
                      <th
                        key={colDate.toISOString()}
                        scope="col"
                        className={`p-2.5 text-center min-w-[90px] border-r border-zinc-200/70 last:border-r-0 ${
                          isToday ? 'bg-blue-50/70 text-blue-900 font-bold' : ''
                        }`}
                      >
                        <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                          {colDate.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-xs font-bold text-zinc-800">
                          {colDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {activeRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-zinc-50/50 transition-colors">
                    {/* Room Info Sticky Column */}
                    <td className="p-2.5 sticky left-0 bg-white z-10 border-r border-zinc-200 font-mono shadow-2xs">
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-zinc-900 text-xs">
                          #{room.room_number}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-sans">
                          {room.floor || 'Floor 1'}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-sans truncate">
                        {room.room_type?.name}
                      </div>
                    </td>

                    {/* Date Grid Cells */}
                    {dateColumns.map((colDate) => (
                      <td
                        key={colDate.toISOString()}
                        className="p-1 text-center h-12 border-r border-zinc-100 last:border-r-0"
                      >
                        {renderCellStatus(room, colDate)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
        <span className="font-bold text-zinc-700 text-[11px] uppercase tracking-wider">
          Legend:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-300" />
          <span>Available / Sellable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-blue-100 border border-blue-300" />
          <span>Cleaning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-100 border border-amber-300" />
          <span>Dirty / Turnover</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-rose-100 border border-rose-300" />
          <span>Maintenance (Non-Sellable)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-zinc-200 border border-zinc-400" />
          <span>Out of Service (OOS)</span>
        </div>
      </div>
    </div>
  );
}
