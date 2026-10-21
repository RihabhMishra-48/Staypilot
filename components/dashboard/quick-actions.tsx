'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
  CalendarPlus,
  LogIn,
  BedDouble,
  Building,
  Info,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const [activeModal, setActiveModal] = React.useState<
    'reservation' | 'checkin' | 'room' | null
  >(null);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setActiveModal('reservation')}
          className="text-xs"
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          <span>New Reservation</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveModal('checkin')}
          className="text-xs"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Quick Check-In</span>
        </Button>

        <Link href="/hotel/rooms">
          <Button variant="outline" size="sm" className="text-xs">
            <BedDouble className="h-3.5 w-3.5" />
            <span>Rooms &amp; Inventory</span>
          </Button>
        </Link>

        <Link href="/hotel/settings">
          <Button variant="ghost" size="sm" className="text-xs">
            <Building className="h-3.5 w-3.5" />
            <span>Property Settings</span>
          </Button>
        </Link>
      </div>

      {/* Reservation Info Dialog */}
      <Dialog
        open={activeModal === 'reservation'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title="Reservation Engine (Scheduled for Phase 3)"
        description="Booking creation, guest allocation, and multi-night folio billing."
        footer={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveModal(null)}
          >
            Understood
          </Button>
        }
      >
        <div className="space-y-3 text-xs leading-relaxed text-zinc-600">
          <div className="rounded-lg bg-blue-50/70 p-3 text-blue-900 border border-blue-200">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4 text-blue-600" />
              <span>Phase 1 Architectural Scope</span>
            </div>
            <p className="mt-1">
              Direct booking input requires the Room Types and Inventory Grid scheduled for <strong>Phase 2</strong>, followed by the Concurrency-Safe Booking Engine in <strong>Phase 3</strong> to prevent double-booking.
            </p>
          </div>
          <p>
            StayPilot does not inject mock bookings into your production database. All reservation tables and guest folios will be generated during Phase 3.
          </p>
        </div>
      </Dialog>

      {/* Quick Check-In Info Dialog */}
      <Dialog
        open={activeModal === 'checkin'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title="Front Desk Express Check-In (Phase 3)"
        description="Fast guest check-in, keycard assignment, and ID proof capture."
        footer={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveModal(null)}
          >
            Got it
          </Button>
        }
      >
        <div className="space-y-3 text-xs leading-relaxed text-zinc-600">
          <p>
            The Front Desk check-in console will allow receptionists to quickly confirm arrivals, verify government identity proofs, collect advance deposits, and change room status to Occupied in real time.
          </p>
          <p className="text-zinc-500">
            This module integrates directly with the Housekeeping and Room Calendar systems in Phase 3.
          </p>
        </div>
      </Dialog>

      {/* Add Room Type Info Dialog */}
      <Dialog
        open={activeModal === 'room'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title="Room Inventory Setup (Phase 2)"
        description="Configure room categories, base rates, extra bed pricing, and physical room numbers."
        footer={
          <div className="flex gap-2">
            <Link href="/dashboard/rooms" onClick={() => setActiveModal(null)}>
              <Button variant="primary" size="sm">
                View Phase 2 Roadmap
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveModal(null)}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs leading-relaxed text-zinc-600">
          <p>
            Room definition will feature Deluxe, Suite, Villa, and Standard layouts with floor planning, capacity limits, and dynamic daily rate plans.
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2.5 border border-zinc-200">
            <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-[11px] text-zinc-600">
              Scheduled next immediately following Phase 1 foundation approval.
            </span>
          </div>
        </div>
      </Dialog>
    </>
  );
}
