'use client';

import * as React from 'react';
import { useHotelProperty } from '@/components/hotel/hotel-layout-client';
import { RoomInventorySummary } from '@/components/rooms/room-inventory-summary';
import { RoomTable } from '@/components/rooms/room-table';
import { RoomModal } from '@/components/rooms/room-modal';
import { ChangeStatusModal } from '@/components/rooms/change-status-modal';
import { Button } from '@/components/ui/button';
import { Room, RoomType, RoomInventoryMetrics } from '@/types';
import { getRooms, getRoomTypes, getRoomInventoryMetrics } from '@/lib/actions/room';
import { BedDouble, Plus, RefreshCw, Layers } from 'lucide-react';
import Link from 'next/link';

export default function HotelRoomsPage() {
  const { currentProperty } = useHotelProperty();
  const propertyId = currentProperty?.id || '';
  const currency = currentProperty?.currency || 'INR';

  const [isLoading, setIsLoading] = React.useState(true);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<RoomType[]>([]);
  const [metrics, setMetrics] = React.useState<RoomInventoryMetrics>({
    totalRooms: 0,
    availableRooms: 0,
    cleaningRooms: 0,
    dirtyRooms: 0,
    maintenanceRooms: 0,
    outOfServiceRooms: 0,
    totalRoomTypes: 0,
    activeRoomTypes: 0,
  });

  const [roomModalOpen, setRoomModalOpen] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null);

  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [statusTargetRoom, setStatusTargetRoom] = React.useState<Room | null>(null);

  const loadData = React.useCallback(async () => {
    if (!propertyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [{ rooms: loadedRooms }, { roomTypes: loadedTypes }, loadedMetrics] =
        await Promise.all([
          getRooms(propertyId, { includeArchived: true }),
          getRoomTypes(propertyId),
          getRoomInventoryMetrics(propertyId),
        ]);

      setRooms(loadedRooms || []);
      setRoomTypes(loadedTypes || []);
      setMetrics(loadedMetrics);
    } catch {
      // Handle gracefully
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  React.useEffect(() => {
    let isMounted = true;
    if (!propertyId) return;

    Promise.all([
      getRooms(propertyId, { includeArchived: true }),
      getRoomTypes(propertyId),
      getRoomInventoryMetrics(propertyId),
    ])
      .then(([{ rooms: loadedRooms }, { roomTypes: loadedTypes }, loadedMetrics]) => {
        if (isMounted) {
          setRooms(loadedRooms || []);
          setRoomTypes(loadedTypes || []);
          setMetrics(loadedMetrics);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propertyId]);

  const handleAddNewRoom = () => {
    setEditingRoom(null);
    setRoomModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomModalOpen(true);
  };

  const handleChangeStatus = (room: Room) => {
    setStatusTargetRoom(room);
    setStatusModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Physical Room Inventory
            </h1>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              PMS Inventory
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Manage individual physical hotel room units, housekeeping conditions, and maintenance blocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            className="text-xs"
            title="Refresh database records"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>

          <Link href="/hotel/room-types">
            <Button variant="outline" size="sm" className="text-xs">
              <Layers className="h-3.5 w-3.5 mr-1 text-blue-600" />
              Room Types
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAddNewRoom}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Room Unit
          </Button>
        </div>
      </div>

      {/* Real Inventory Metrics Summary */}
      <RoomInventorySummary metrics={metrics} />

      {/* Room Table */}
      <RoomTable
        rooms={rooms}
        roomTypes={roomTypes}
        propertyId={propertyId}
        currency={currency}
        onAddNewRoom={handleAddNewRoom}
        onEditRoom={handleEditRoom}
        onChangeStatus={handleChangeStatus}
        onRoomArchived={loadData}
      />

      {/* Modals */}
      <RoomModal
        open={roomModalOpen}
        onOpenChange={setRoomModalOpen}
        propertyId={propertyId}
        currency={currency}
        roomTypes={roomTypes.filter((t) => t.is_active)}
        initialData={editingRoom}
        onSuccess={loadData}
      />

      <ChangeStatusModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        propertyId={propertyId}
        room={statusTargetRoom}
        onSuccess={loadData}
      />
    </div>
  );
}
