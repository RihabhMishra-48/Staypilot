'use client';

import * as React from 'react';
import { usePropertyContext } from '@/components/layout/dashboard-layout-client';
import { ConfigWarningBanner } from '@/components/dashboard/config-warning-banner';
import { RoomInventorySummary } from '@/components/rooms/room-inventory-summary';
import { RoomTable } from '@/components/rooms/room-table';
import { RoomTypeList } from '@/components/rooms/room-type-list';
import { RoomModal } from '@/components/rooms/room-modal';
import { RoomTypeModal } from '@/components/rooms/room-type-modal';
import { ChangeStatusModal } from '@/components/rooms/change-status-modal';
import { Button } from '@/components/ui/button';
import { Room, RoomType, RoomInventoryMetrics } from '@/types';
import { getRooms, getRoomTypes, getRoomInventoryMetrics } from '@/lib/actions/room';
import { BedDouble, Layers, Plus, RefreshCw } from 'lucide-react';

export default function RoomsInventoryPage() {
  const { currentProperty, isConfigured } = usePropertyContext();
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

  // Active view tab: 'rooms' | 'categories'
  const [activeTab, setActiveTab] = React.useState<'rooms' | 'categories'>('rooms');

  // Modals state
  const [roomModalOpen, setRoomModalOpen] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null);

  const [typeModalOpen, setTypeModalOpen] = React.useState(false);
  const [editingType, setEditingType] = React.useState<RoomType | null>(null);

  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [statusTargetRoom, setStatusTargetRoom] = React.useState<Room | null>(null);

  const loadData = React.useCallback(async () => {
    if (!propertyId || !isConfigured) {
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
  }, [propertyId, isConfigured]);

  React.useEffect(() => {
    let isMounted = true;
    if (!propertyId || !isConfigured) {
      return;
    }

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
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyId, isConfigured]);

  // Handlers
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

  const handleAddNewType = () => {
    setEditingType(null);
    setTypeModalOpen(true);
  };

  const handleEditType = (type: RoomType) => {
    setEditingType(type);
    setTypeModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Configuration warning banner */}
      <ConfigWarningBanner isConfigured={isConfigured} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Rooms &amp; Inventory Management
            </h1>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Phase 2 Live
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Configure room types, individual physical room units, operational statuses, and live sellable availability.
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddNewType}
            className="text-xs"
          >
            <Layers className="h-3.5 w-3.5 mr-1 text-blue-600" />
            Add Category
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAddNewRoom}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Real Inventory Metrics Summary */}
      <RoomInventorySummary metrics={metrics} />

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'rooms'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <BedDouble className="h-4 w-4" />
          <span>Physical Rooms ({rooms.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Room Categories &amp; Pricing ({roomTypes.length})</span>
        </button>
      </div>

      {/* Content according to tab */}
      {activeTab === 'rooms' && (
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
      )}

      {activeTab === 'categories' && (
        <RoomTypeList
          roomTypes={roomTypes}
          currency={currency}
          onAddNewType={handleAddNewType}
          onEditRoomType={handleEditType}
        />
      )}

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

      <RoomTypeModal
        open={typeModalOpen}
        onOpenChange={setTypeModalOpen}
        propertyId={propertyId}
        currency={currency}
        initialData={editingType}
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
