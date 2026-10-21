'use client';

import * as React from 'react';
import { usePropertyContext } from '@/components/layout/dashboard-layout-client';
import { ConfigWarningBanner } from '@/components/dashboard/config-warning-banner';
import { RoomCalendarView } from '@/components/calendar/room-calendar-view';
import { Button } from '@/components/ui/button';
import { Room, RoomType } from '@/types';
import { getRooms, getRoomTypes } from '@/lib/actions/room';
import { RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const { currentProperty, isConfigured } = usePropertyContext();
  const propertyId = currentProperty?.id || '';
  const currency = currentProperty?.currency || 'INR';

  const [isLoading, setIsLoading] = React.useState(true);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<RoomType[]>([]);

  const loadData = React.useCallback(async () => {
    if (!propertyId || !isConfigured) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [{ rooms: loadedRooms }, { roomTypes: loadedTypes }] = await Promise.all([
        getRooms(propertyId, { includeArchived: false }),
        getRoomTypes(propertyId),
      ]);

      setRooms(loadedRooms || []);
      setRoomTypes(loadedTypes || []);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, isConfigured]);

  React.useEffect(() => {
    let isMounted = true;
    if (!propertyId || !isConfigured) {
      return;
    }

    Promise.all([
      getRooms(propertyId, { includeArchived: false }),
      getRoomTypes(propertyId),
    ])
      .then(([{ rooms: loadedRooms }, { roomTypes: loadedTypes }]) => {
        if (isMounted) {
          setRooms(loadedRooms || []);
          setRoomTypes(loadedTypes || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyId, isConfigured]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Configuration warning banner */}
      <ConfigWarningBanner isConfigured={isConfigured} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Room Calendar &amp; Tape Chart
            </h1>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Phase 2 Live
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Multi-day operational tape chart tracking physical room readiness, cleaning turnovers, and maintenance status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            className="text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>

          <Link href="/dashboard/rooms">
            <Button variant="primary" size="sm" className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Manage Inventory
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Tape Chart Component */}
      <RoomCalendarView
        rooms={rooms}
        roomTypes={roomTypes}
        currency={currency}
      />
    </div>
  );
}
