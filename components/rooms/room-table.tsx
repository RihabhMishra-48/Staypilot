'use client';

import * as React from 'react';
import { Room, RoomType, OperationalStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { archiveRoomAction } from '@/lib/actions/room';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Wrench,
  Lock,
  Edit2,
  Archive,
  RotateCcw,
  Plus,
} from 'lucide-react';

interface RoomTableProps {
  rooms: Room[];
  roomTypes: RoomType[];
  propertyId: string;
  currency?: string;
  onEditRoom: (room: Room) => void;
  onChangeStatus: (room: Room) => void;
  onAddNewRoom: () => void;
  onRoomArchived: (updated: Room) => void;
}

export function RoomTable({
  rooms,
  roomTypes,
  propertyId,
  currency = 'INR',
  onEditRoom,
  onChangeStatus,
  onAddNewRoom,
  onRoomArchived,
}: RoomTableProps) {
  const [search, setSearch] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [showArchived, setShowArchived] = React.useState(false);

  // Archive confirmation dialog state
  const [archiveTarget, setArchiveTarget] = React.useState<{
    room: Room;
    isArchiving: boolean;
  } | null>(null);
  const [isArchivingLoading, setIsArchivingLoading] = React.useState(false);

  // Filtered rooms
  const filteredRooms = React.useMemo(() => {
    return rooms.filter((r) => {
      // Archived filter
      if (!showArchived && r.is_archived) return false;
      if (showArchived && !r.is_archived) return false;

      // Room Type filter
      if (selectedType !== 'all' && r.room_type_id !== selectedType) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && r.operational_status !== selectedStatus) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const numberMatch = r.room_number.toLowerCase().includes(query);
        const typeMatch = r.room_type?.name.toLowerCase().includes(query);
        const floorMatch = r.floor?.toLowerCase().includes(query);
        if (!numberMatch && !typeMatch && !floorMatch) return false;
      }

      return true;
    });
  }, [rooms, search, selectedType, selectedStatus, showArchived]);

  const getStatusBadge = (status: OperationalStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            Available
          </span>
        );
      case 'cleaning':
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="h-3 w-3 shrink-0" />
            Cleaning
          </span>
        );
      case 'dirty':
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            Dirty
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <Wrench className="h-3 w-3 shrink-0" />
            Maintenance
          </span>
        );
      case 'out_of_service':
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
            <Lock className="h-3 w-3 shrink-0" />
            Out of Service
          </span>
        );
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    setIsArchivingLoading(true);

    try {
      const res = await archiveRoomAction(
        archiveTarget.room.id,
        propertyId,
        archiveTarget.isArchiving
      );
      if (res.success && res.data) {
        onRoomArchived(res.data);
      }
    } finally {
      setIsArchivingLoading(false);
      setArchiveTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <Input
              placeholder="Search by room #, category, floor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>

          {/* Filter by Category */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="flex h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="all">All Room Types</option>
            {roomTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Filter by Operational Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="cleaning">Cleaning</option>
            <option value="dirty">Dirty</option>
            <option value="maintenance">Maintenance</option>
            <option value="out_of_service">Out of Service</option>
          </select>

          {/* Show Archived Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer ml-1">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <span>View Archived ({rooms.filter((r) => r.is_archived).length})</span>
          </label>
        </div>

        <Button variant="primary" size="sm" onClick={onAddNewRoom} className="text-xs shrink-0">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Room
        </Button>
      </div>

      {/* Table Content */}
      <div className="rounded-xl border border-zinc-200/90 bg-white shadow-2xs overflow-hidden">
        {filteredRooms.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 mb-2">
              <Filter className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-zinc-800">
              {rooms.length === 0
                ? 'No physical rooms registered yet'
                : 'No rooms match your search filters'}
            </h4>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
              {rooms.length === 0
                ? 'Add your hotel physical room numbers to start managing live inventory and room calendar.'
                : 'Try adjusting your room number search or clearing the status/category filters.'}
            </p>
            {rooms.length === 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={onAddNewRoom}
                className="mt-3 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Your First Room
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Room #
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Category / Type
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Floor &amp; Wing
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Base Nightly Rate
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Operational Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Notes
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-zinc-900 font-mono">
                      {room.room_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-800">
                      {room.room_type?.name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {room.floor || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-700">
                      {room.room_type?.base_rate
                        ? formatCurrency(room.room_type.base_rate, currency)
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(room.operational_status)}</td>
                    <td className="px-4 py-3 text-zinc-500 max-w-[200px] truncate">
                      {room.notes || <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onChangeStatus(room)}
                          className="h-7 px-2 text-[11px]"
                          title="Change operational status"
                        >
                          Status
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditRoom(room)}
                          className="h-7 px-2 text-[11px]"
                          title="Edit room configuration"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setArchiveTarget({
                              room,
                              isArchiving: !room.is_archived,
                            })
                          }
                          className="h-7 px-2 text-[11px] text-zinc-500 hover:text-zinc-800"
                          title={room.is_archived ? 'Restore room' : 'Archive room'}
                        >
                          {room.is_archived ? (
                            <RotateCcw className="h-3 w-3 text-blue-600" />
                          ) : (
                            <Archive className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Archive / Restore Confirmation Dialog */}
      <Dialog
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title={
          archiveTarget?.isArchiving
            ? `Archive Room ${archiveTarget.room.room_number}?`
            : `Restore Room ${archiveTarget?.room.room_number}?`
        }
        description={
          archiveTarget?.isArchiving
            ? 'Archiving hides the physical room from active inventory and tape chart views without destroying historical records.'
            : 'Restoring returns this physical room to the active inventory grid.'
        }
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setArchiveTarget(null)}
              disabled={isArchivingLoading}
            >
              Cancel
            </Button>
            <Button
              variant={archiveTarget?.isArchiving ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirmArchive}
              isLoading={isArchivingLoading}
            >
              {archiveTarget?.isArchiving ? 'Archive Room' : 'Restore Room'}
            </Button>
          </div>
        }
      >
        <p className="text-xs text-zinc-600">
          Room <strong>{archiveTarget?.room.room_number}</strong> ({archiveTarget?.room.room_type?.name})
        </p>
      </Dialog>
    </div>
  );
}
