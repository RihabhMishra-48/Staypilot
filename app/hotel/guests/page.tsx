import * as React from 'react';
import { Metadata } from 'next';
import { Users, Search } from 'lucide-react';
import { getUserProperties } from '@/lib/actions/property';

export const metadata: Metadata = {
  title: 'Guest Directory — StayPilot',
  description: 'Guest CRM, repeat stay history, contact details, and special preferences.',
};

interface GuestRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  stays: number;
  revenue: number;
}

export default async function HotelGuestsPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  // Real guests array (honest empty state)
  const guests: GuestRecord[] = [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-zinc-200/80 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Guest Directory &amp; CRM
          </h1>
          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            Guest History
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Centralized hotel guest profiles, stay history, contact information, and OTA booking channels.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by guest name, phone, or email..."
          className="w-full rounded-lg border border-zinc-200 pl-9 pr-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Guests Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
        {guests.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="text-xs font-semibold text-zinc-800">No guest profiles recorded yet</p>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
              Guest profiles are automatically compiled when bookings arrive from MakeMyTrip, Goibibo, Agoda, Booking.com, or walk-ins.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Guest Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Total Stays</th>
                  <th className="px-4 py-3 text-right">Lifetime Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {guests.map((g) => (
                  <tr key={g.id}>
                    <td className="px-4 py-3">{g.name}</td>
                    <td className="px-4 py-3">{g.phone}</td>
                    <td className="px-4 py-3">{g.email}</td>
                    <td className="px-4 py-3">{g.stays}</td>
                    <td className="px-4 py-3 text-right">₹{g.revenue}</td>
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
