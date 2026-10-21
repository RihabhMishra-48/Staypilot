'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { UpcomingArrival } from '@/types';
import { Clock, UserCheck, CheckCircle2 } from 'lucide-react';

interface UpcomingArrivalsProps {
  arrivals: UpcomingArrival[];
}

export function UpcomingArrivals({ arrivals }: UpcomingArrivalsProps) {
  const [selectedArrival, setSelectedArrival] = React.useState<UpcomingArrival | null>(null);

  const getPaymentBadge = (status: UpcomingArrival['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Fully Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pay on Arrival</Badge>;
      case 'partial':
        return <Badge variant="info">Deposit Paid</Badge>;
    }
  };

  return (
    <>
      <Card className="border-zinc-200/90 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-zinc-900">
            Today&apos;s Arrivals
          </CardTitle>
          <CardDescription className="text-xs">
            Expected check-ins scheduled for today.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {arrivals.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <p className="text-xs font-semibold text-zinc-700">No arrivals scheduled for today</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Guest arrivals and express check-in queues will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
            {arrivals.map((arrival) => (
              <div
                key={arrival.id}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-zinc-900 truncate">
                    {arrival.guestName}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {arrival.roomType} • {arrival.nights} night{arrival.nights > 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                      <Clock className="h-3 w-3 text-zinc-400" />
                      {arrival.arrivalTime}
                    </span>
                    {getPaymentBadge(arrival.paymentStatus)}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedArrival(arrival)}
                  className="shrink-0 text-[11px] h-7 px-2"
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Check In
                </Button>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </Card>

      {/* Check In Action Dialog */}
      <Dialog
        open={!!selectedArrival}
        onOpenChange={(open) => !open && setSelectedArrival(null)}
        title="Express Check-In Workflow"
        description={`Process arrival for ${selectedArrival?.guestName || 'Guest'}`}
        footer={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedArrival(null)}
          >
            Close Preview
          </Button>
        }
      >
        <div className="space-y-3 text-xs text-zinc-600">
          <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] uppercase text-zinc-400 block font-semibold">
                  Assigned Room
                </span>
                <span className="font-semibold text-zinc-800">
                  {selectedArrival?.roomNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-zinc-400 block font-semibold">
                  Duration
                </span>
                <span className="font-semibold text-zinc-800">
                  {selectedArrival?.nights} Night(s)
                </span>
              </div>
            </div>
          </div>
          <p>
            In Phase 3, this button launches the live Front Desk check-in sequence: ID capture, folio generation, keycard assignment, and guest registration card generation.
          </p>
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2 rounded-md border border-emerald-200 text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>Honest state: No fake mutations are made to the database in Phase 1.</span>
          </div>
        </div>
      </Dialog>
    </>
  );
}
