'use client';

import * as React from 'react';
import { useHotelProperty } from '@/components/hotel/hotel-layout-client';
import { RoomCalendarView } from '@/components/calendar/room-calendar-view';
import { Button } from '@/components/ui/button';
import { Room, RoomType } from '@/types';
import { getRooms, getRoomTypes } from '@/lib/actions/room';
import { RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';

export default function HotelCalendarPage() {
  const { currentProperty } = useHotelProperty();
  const propertyId = currentProperty?.id || '';
  const currency = currentProperty?.currency || 'INR';

  const [isLoading, setIsLoading] = React.useState(true);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<RoomType[]>([]);

  const loadData = React.useCallback(async () => {
    if (!propertyId) {
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
  }, [propertyId]);

  React.useEffect(() => {
    let ignore = false;
    async function fetchData() {
      if (!propertyId) {
        setIsLoading(false);
        return;
      }

      try {
        const [{ rooms: loadedRooms }, { roomTypes: loadedTypes }] = await Promise.all([
          getRooms(propertyId, { includeArchived: false }),
          getRoomTypes(propertyId),
        ]);

        if (!ignore) {
          setRooms(loadedRooms || []);
          setRoomTypes(loadedTypes || []);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [propertyId]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Room Calendar &amp; Tape Chart
            </h1>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Live Tape Chart
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

          <Link href="/hotel/rooms">
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
