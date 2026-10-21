import * as React from 'react';
import { Metadata } from 'next';
import { getUserProperties } from '@/lib/actions/property';
import { getPropertyChannelSummaries } from '@/lib/actions/channel';
import { getRoomInventoryMetrics } from '@/lib/actions/room';
import { ChannelSummary } from '@/types';

export const metadata: Metadata = {
  title: 'Reports & Channel Production — StayPilot',
  description: 'Channel manager production, occupancy rates, ADR, and revenue analytics.',
};

export default async function HotelReportsPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  let channelSummaries: ChannelSummary[] = [];
  let metrics = { totalRooms: 0, availableRooms: 0, activeRoomTypes: 0 };

  if (currentProperty) {
    const [fetchedSummaries, fetchedMetrics] = await Promise.all([
      getPropertyChannelSummaries(currentProperty.id),
      getRoomInventoryMetrics(currentProperty.id),
    ]);
    channelSummaries = fetchedSummaries;
    metrics = fetchedMetrics;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-zinc-200/80 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Channel Production &amp; Revenue Reports
          </h1>
          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            Channel Analytics
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Distribution performance across MakeMyTrip, Goibibo, Agoda, Booking.com, and front desk walk-ins.
        </p>
      </div>

      {/* KPI Row (Honest Baselines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-zinc-500">Total Revenue</span>
          <p className="text-2xl font-bold text-zinc-900">₹0</p>
          <span className="text-[10px] text-zinc-400">Current month settled folios</span>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-zinc-500">Average Daily Rate (ADR)</span>
          <p className="text-2xl font-bold text-zinc-900">₹0</p>
          <span className="text-[10px] text-zinc-400">Average rate per sold room night</span>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-zinc-500">Occupancy Rate</span>
          <p className="text-2xl font-bold text-zinc-900">0.0%</p>
          <span className="text-[10px] text-zinc-400">Based on {metrics.totalRooms} total rooms</span>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-zinc-500">RevPAR</span>
          <p className="text-2xl font-bold text-zinc-900">₹0</p>
          <span className="text-[10px] text-zinc-400">Revenue per available room</span>
        </div>
      </div>

      {/* Channel Share Breakdown Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-900">Distribution Share by Channel</h2>
          <p className="text-xs text-zinc-500">Room nights generated and revenue yield by partner.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Channel Name</th>
                <th className="px-4 py-3">Connection Status</th>
                <th className="px-4 py-3 text-center">Bookings Transmitted</th>
                <th className="px-4 py-3 text-center">Room Nights</th>
                <th className="px-4 py-3 text-right">Production Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {channelSummaries.map((summary) => (
                <tr key={summary.channel} className="hover:bg-zinc-50/70">
                  <td className="px-4 py-3 font-semibold text-zinc-900">{summary.displayName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        summary.connection?.status === 'connected'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {summary.connection?.status || 'Disconnected'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono">0</td>
                  <td className="px-4 py-3 text-center font-mono">0</td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-900">₹0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
