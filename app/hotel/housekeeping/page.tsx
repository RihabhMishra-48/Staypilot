import * as React from 'react';
import { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { getUserProperties } from '@/lib/actions/property';
import { getRooms, getRoomInventoryMetrics } from '@/lib/actions/room';
import { Room } from '@/types';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Housekeeping & Turnover — StayPilot',
  description: 'Manage room cleanliness status, turnovers, and maintenance logs.',
};

export default async function HotelHousekeepingPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  let rooms: Room[] = [];
  let metrics = {
    cleaningRooms: 0,
    dirtyRooms: 0,
    availableRooms: 0,
    maintenanceRooms: 0,
  };

  if (currentProperty) {
    const [{ rooms: loadedRooms }, loadedMetrics] = await Promise.all([
      getRooms(currentProperty.id),
      getRoomInventoryMetrics(currentProperty.id),
    ]);
    rooms = loadedRooms || [];
    metrics = loadedMetrics;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Housekeeping &amp; Room Turnover
            </h1>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Operational Readiness
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Track room cleanliness conditions (Dirty, Cleaning, Ready, Out of Service) to release units into sellable OTA inventory.
          </p>
        </div>

        <Link
          href="/hotel/rooms"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs self-start sm:self-auto"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Update Room Status</span>
        </Link>
      </div>

      {/* Housekeeping Status Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-zinc-500">Clean &amp; Available</span>
          <p className="text-2xl font-bold text-emerald-600">{metrics.availableRooms}</p>
          <span className="text-[10px] text-zinc-400">Ready for guest check-in</span>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-zinc-500">In Cleaning</span>
          <p className="text-2xl font-bold text-blue-600">{metrics.cleaningRooms}</p>
          <span className="text-[10px] text-zinc-400">Housekeeper assigned</span>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-zinc-500">Dirty / Turnover</span>
          <p className="text-2xl font-bold text-amber-600">{metrics.dirtyRooms}</p>
          <span className="text-[10px] text-zinc-400">Awaiting housekeeping</span>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-zinc-500">Maintenance</span>
          <p className="text-2xl font-bold text-rose-600">{metrics.maintenanceRooms}</p>
          <span className="text-[10px] text-zinc-400">Excluded from OTA inventory</span>
        </div>
      </div>

      {/* Room Cleanliness Roster Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900">Physical Unit Cleanliness Roster</h2>
          <span className="text-xs text-zinc-500">{rooms.length} Units</span>
        </div>

        {rooms.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            No rooms created yet. Add rooms in Room Inventory to begin housekeeping tracking.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Room Unit</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Floor</th>
                  <th className="px-4 py-3">Housekeeping Condition</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-zinc-50/70">
                    <td className="px-4 py-3 font-bold text-zinc-900">Room {room.room_number}</td>
                    <td className="px-4 py-3 text-zinc-600">{room.room_type?.name || 'Standard'}</td>
                    <td className="px-4 py-3 text-zinc-500">{room.floor || 'Floor 1'}</td>
                    <td className="px-4 py-3 capitalize font-semibold">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                          room.operational_status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : room.operational_status === 'cleaning'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : room.operational_status === 'dirty'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {room.operational_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href="/hotel/rooms"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Update Status →
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
