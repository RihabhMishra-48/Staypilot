import * as React from 'react';
import { Metadata } from 'next';
import { DollarSign, Plus } from 'lucide-react';
import { getUserProperties } from '@/lib/actions/property';
import { getRoomTypes } from '@/lib/actions/room';
import { RoomType } from '@/types';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rate Plans & Pricing — StayPilot',
  description: 'Manage master base pricing, seasonal rates, and OTA distribution markups.',
};

export default async function HotelRatesPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  let roomTypes: RoomType[] = [];
  if (currentProperty) {
    const res = await getRoomTypes(currentProperty.id);
    roomTypes = res.roomTypes || [];
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Rate Plans &amp; Pricing Management
            </h1>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Pricing Engine
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Define standard base rates, weekend multipliers, meal plan supplements, and non-refundable rates.
          </p>
        </div>

        <Link
          href="/hotel/room-types"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Edit Room Category Rates</span>
        </Link>
      </div>

      {/* Room Category Rates Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900">Master Base Nightly Rates</h2>
          <span className="text-xs text-zinc-400">{roomTypes.length} Active Categories</span>
        </div>

        {roomTypes.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <DollarSign className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="text-xs font-semibold text-zinc-800">No room categories configured</p>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
              Create room types with baseline night rates to manage dynamic pricing and channel rate plans.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Category Name</th>
                  <th className="px-4 py-3">Occupancy</th>
                  <th className="px-4 py-3">Base Night Rate</th>
                  <th className="px-4 py-3">Standard Meal Plan</th>
                  <th className="px-4 py-3 text-right">Channel Matrix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {roomTypes.map((rt) => (
                  <tr key={rt.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-zinc-900">{rt.name}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {rt.max_adults} Adults, {rt.max_children} Children
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900">
                      ₹{rt.base_rate.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">EP (Room Only)</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href="/hotel/channel-manager"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Map OTA Rates →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
