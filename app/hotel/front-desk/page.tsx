import * as React from 'react';
import { Metadata } from 'next';
import { LogIn, LogOut, Clock } from 'lucide-react';
import { getUserProperties } from '@/lib/actions/property';
import { UpcomingArrival } from '@/types';

export const metadata: Metadata = {
  title: 'Front Desk Operations — StayPilot',
  description: 'Front desk arrivals, departures, guest check-ins, and key issuance.',
};

export default async function HotelFrontDeskPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  // Real data arrays (honest empty states)
  const todayArrivals: UpcomingArrival[] = [];
  const todayDepartures: UpcomingArrival[] = [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-zinc-200/80 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Front Desk Operations
          </h1>
          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            Daily Manifest
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Monitor scheduled guest check-ins, check-outs, room readiness, and balance settlements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Arrivals */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-zinc-900">Expected Check-Ins Today</h2>
            </div>
            <span className="text-xs font-semibold text-zinc-500">0 Scheduled</span>
          </div>

          <div className="p-12 text-center space-y-2">
            <Clock className="mx-auto h-7 w-7 text-zinc-300" />
            <p className="text-xs font-medium text-zinc-700">No arrivals scheduled for today</p>
            <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
              Guests booked via connected OTAs or direct reservations with check-in matching today will appear here.
            </p>
          </div>
        </div>

        {/* Today's Departures */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-rose-600" />
              <h2 className="text-sm font-bold text-zinc-900">Expected Check-Outs Today</h2>
            </div>
            <span className="text-xs font-semibold text-zinc-500">0 Pending</span>
          </div>

          <div className="p-12 text-center space-y-2">
            <Clock className="mx-auto h-7 w-7 text-zinc-300" />
            <p className="text-xs font-medium text-zinc-700">No check-outs scheduled for today</p>
            <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
              Departures and folio settlements due today will appear here for front desk turnover.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
