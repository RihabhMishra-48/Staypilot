import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReservationPreview } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface RecentReservationsProps {
  reservations: ReservationPreview[];
  currency?: string;
}

export function RecentReservations({
  reservations,
  currency = 'INR',
}: RecentReservationsProps) {
  const getStatusBadge = (status: ReservationPreview['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="info">Confirmed</Badge>;
      case 'checked_in':
        return <Badge variant="success">Checked In</Badge>;
      case 'checked_out':
        return <Badge variant="default">Checked Out</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceBadge = (source: ReservationPreview['source']) => {
    switch (source) {
      case 'Direct':
        return (
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Direct Web
          </span>
        );
      case 'Booking.com':
        return (
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            Booking.com
          </span>
        );
      case 'MakeMyTrip':
        return (
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-orange-50 text-orange-800 border border-orange-200">
            MakeMyTrip
          </span>
        );
      case 'Agoda':
        return (
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Agoda
          </span>
        );
      case 'Goibibo':
        return (
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            Goibibo
          </span>
        );
    }
  };

  return (
    <Card className="border-zinc-200/90 shadow-2xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
        <div>
          <CardTitle className="text-sm font-bold text-zinc-900">
            Recent Reservations
          </CardTitle>
          <CardDescription className="text-xs">
            Live guest reservations and channel booking folios.
          </CardDescription>
        </div>

        <Link
          href="/dashboard/reservations"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>View All Folios</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {reservations.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <p className="text-xs font-semibold text-zinc-700">No reservations recorded yet</p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
              Guest folios and bookings from front desk check-ins or online channels will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-y border-zinc-200/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th scope="col" className="px-4 py-2.5">
                    Reference &amp; Guest
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Room Details
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Stay Dates
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Channel
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right">
                    Total Folio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-zinc-900">{res.guestName}</p>
                      <p className="font-mono text-[10px] text-zinc-400">
                        {res.bookingRef}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-800">{res.roomType}</p>
                      <p className="text-[10px] text-zinc-500">Room #{res.roomNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      <div>{formatDate(res.checkIn)}</div>
                      <div className="text-[10px] text-zinc-400">
                        to {formatDate(res.checkOut)}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getSourceBadge(res.source)}</td>
                    <td className="px-4 py-3">{getStatusBadge(res.status)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-900">
                      {formatCurrency(res.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
