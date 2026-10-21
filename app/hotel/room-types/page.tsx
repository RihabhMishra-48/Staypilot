'use client';

import * as React from 'react';
import { useHotelProperty } from '@/components/hotel/hotel-layout-client';
import { RoomTypeList } from '@/components/rooms/room-type-list';
import { RoomTypeModal } from '@/components/rooms/room-type-modal';
import { Button } from '@/components/ui/button';
import { RoomType } from '@/types';
import { getRoomTypes } from '@/lib/actions/room';
import { Plus, RefreshCw, BedDouble } from 'lucide-react';
import Link from 'next/link';

export default function HotelRoomTypesPage() {
  const { currentProperty } = useHotelProperty();
  const propertyId = currentProperty?.id || '';
  const currency = currentProperty?.currency || 'INR';

  const [isLoading, setIsLoading] = React.useState(true);
  const [roomTypes, setRoomTypes] = React.useState<RoomType[]>([]);
  const [typeModalOpen, setTypeModalOpen] = React.useState(false);
  const [editingType, setEditingType] = React.useState<RoomType | null>(null);

  const loadData = React.useCallback(async () => {
    if (!propertyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { roomTypes: loadedTypes } = await getRoomTypes(propertyId);
      setRoomTypes(loadedTypes || []);
    } catch {
      // Handle gracefully
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
        const { roomTypes: loadedTypes } = await getRoomTypes(propertyId);
        if (!ignore) {
          setRoomTypes(loadedTypes || []);
        }
      } catch {
        // Handle gracefully
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

  const handleAddNewType = () => {
    setEditingType(null);
    setTypeModalOpen(true);
  };

  const handleEditType = (type: RoomType) => {
    setEditingType(type);
    setTypeModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Room Categories &amp; Pricing
            </h1>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Rate Plans
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Configure master room types, guest capacities, standard amenities, and base night rates for OTA mapping.
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
            <Button variant="outline" size="sm" className="text-xs">
              <BedDouble className="h-3.5 w-3.5 mr-1 text-blue-600" />
              Room Units
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAddNewType}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Room Category
          </Button>
        </div>
      </div>

      {/* Room Type List Component */}
      <RoomTypeList
        roomTypes={roomTypes}
        currency={currency}
        onAddNewType={handleAddNewType}
        onEditRoomType={handleEditType}
      />

      {/* Room Type Modal */}
      <RoomTypeModal
        open={typeModalOpen}
        onOpenChange={setTypeModalOpen}
        propertyId={propertyId}
        currency={currency}
        initialData={editingType}
        onSuccess={loadData}
      />
    </div>
  );
}
