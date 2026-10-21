import * as React from 'react';
import { Metadata } from 'next';
import { BookOpen, Search } from 'lucide-react';
import { getUserProperties } from '@/lib/actions/property';
import { ReservationPreview } from '@/types';

export const metadata: Metadata = {
  title: 'Reservations & Folios — StayPilot',
  description: 'Manage OTA channel bookings, front desk folios, and reservation statuses.',
};

export default async function HotelReservationsPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  // Real reservations from database
  const reservations: ReservationPreview[] = [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Reservations &amp; Folios
            </h1>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Live Bookings
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Incoming reservations transmitted via connected OTA channels and direct walk-in folios.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-2xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by guest name or booking reference..."
            className="w-full rounded-lg border border-zinc-200 pl-8 pr-3 py-1.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-800">
          <option value="all">All Channels</option>
          <option value="MakeMyTrip">MakeMyTrip</option>
          <option value="Goibibo">Goibibo</option>
          <option value="Agoda">Agoda</option>
          <option value="Booking.com">Booking.com</option>
        </select>

        <select className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-800">
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Reservations Table with Honest Empty State */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
        {reservations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <BookOpen className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="text-xs font-semibold text-zinc-800">No reservations recorded yet</p>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
              Reservations will appear here automatically when received via connected OTA webhooks or entered at the front desk.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Guest Name</th>
                  <th className="px-4 py-3">Room Type</th>
                  <th className="px-4 py-3">Stay Dates</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {reservations.map((res) => (
                  <tr key={res.id}>
                    <td className="px-4 py-3 font-mono">{res.bookingRef}</td>
                    <td className="px-4 py-3 font-semibold">{res.guestName}</td>
                    <td className="px-4 py-3">{res.roomType}</td>
                    <td className="px-4 py-3">{res.checkIn} to {res.checkOut}</td>
                    <td className="px-4 py-3">{res.source}</td>
                    <td className="px-4 py-3">{res.status}</td>
                    <td className="px-4 py-3 text-right">₹{res.amount}</td>
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
