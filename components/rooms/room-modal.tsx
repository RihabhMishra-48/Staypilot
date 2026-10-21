'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Room, RoomType, ActionResponse, OperationalStatus } from '@/types';
import { createRoomAction, updateRoomAction } from '@/lib/actions/room';
import { formatCurrency } from '@/lib/utils';

interface RoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  currency?: string;
  roomTypes: RoomType[];
  initialData?: Room | null;
  onSuccess: (room: Room) => void;
}

function RoomForm({
  propertyId,
  currency,
  roomTypes,
  initialData,
  onOpenChange,
  onSuccess,
}: {
  propertyId: string;
  currency: string;
  roomTypes: RoomType[];
  initialData?: Room | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (room: Room) => void;
}) {
  const isEditing = !!initialData?.id;

  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ActionResponse<Room> | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const [formData, setFormData] = React.useState({
    room_number: initialData?.room_number || '',
    room_type_id: initialData?.room_type_id || (roomTypes.length > 0 ? roomTypes[0].id : ''),
    floor: initialData?.floor || 'Ground Floor',
    operational_status: (initialData?.operational_status || 'available') as OperationalStatus,
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setFieldErrors({});

    const data = new FormData();
    data.append('property_id', propertyId);
    data.append('room_number', formData.room_number);
    data.append('room_type_id', formData.room_type_id);
    data.append('floor', formData.floor);
    data.append('operational_status', formData.operational_status);
    data.append('notes', formData.notes);

    try {
      let res: ActionResponse<Room>;
      if (isEditing && initialData?.id) {
        res = await updateRoomAction(initialData.id, null, data);
      } else {
        res = await createRoomAction(null, data);
      }

      setResult(res);

      if (res.errors) {
        setFieldErrors(res.errors);
      }

      if (res.success && res.data) {
        onSuccess(res.data);
        onOpenChange(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setResult({ success: false, message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result && !result.success && (
        <Alert variant="error" title="Submission Error">
          {result.message}
        </Alert>
      )}

      {roomTypes.length === 0 ? (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
          <strong>Prerequisite:</strong> Please create at least one active Room Type before registering physical room units.
        </div>
      ) : (
        <>
          {/* Room Number & Floor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="room-no" required>
                Room Number / Name
              </Label>
              <Input
                id="room-no"
                placeholder="e.g. 101 or Villa-01"
                value={formData.room_number}
                onChange={(e) =>
                  setFormData({ ...formData, room_number: e.target.value })
                }
                error={!!fieldErrors.room_number}
                required
              />
              {fieldErrors.room_number && (
                <p className="text-[11px] text-rose-600">{fieldErrors.room_number[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="room-floor">Floor / Wing</Label>
              <Input
                id="room-floor"
                placeholder="e.g. 1st Floor / East Wing"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                error={!!fieldErrors.floor}
              />
            </div>
          </div>

          {/* Room Type Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="room-type-select" required>
              Assigned Category / Room Type
            </Label>
            <select
              id="room-type-select"
              value={formData.room_type_id}
              onChange={(e) =>
                setFormData({ ...formData, room_type_id: e.target.value })
              }
              className="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              required
            >
              {roomTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} — {formatCurrency(type.base_rate, currency)}/night (Max: {type.max_adults} Adults)
                </option>
              ))}
            </select>
            {fieldErrors.room_type_id && (
              <p className="text-[11px] text-rose-600">{fieldErrors.room_type_id[0]}</p>
            )}
          </div>

          {/* Operational Status */}
          <div className="space-y-1.5">
            <Label htmlFor="room-status" required>
              Current Operational Status
            </Label>
            <select
              id="room-status"
              value={formData.operational_status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  operational_status: e.target.value as OperationalStatus,
                })
              }
              className="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 capitalize"
              required
            >
              <option value="available">Available (Inspected &amp; Ready)</option>
              <option value="cleaning">Cleaning (Housekeeper in room)</option>
              <option value="dirty">Dirty (Requires Turnover)</option>
              <option value="maintenance">Maintenance (Repairs required)</option>
              <option value="out_of_service">Out of Service (Temporary lock)</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="room-notes">Internal Notes</Label>
            <textarea
              id="room-notes"
              rows={2}
              className="w-full rounded-lg border border-zinc-300 p-2 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              placeholder="Corner room with garden access; extra power sockets near desk."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
            >
              {isEditing ? 'Save Changes' : 'Register Room'}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

export function RoomModal({
  open,
  onOpenChange,
  propertyId,
  currency = 'INR',
  roomTypes,
  initialData,
  onSuccess,
}: RoomModalProps) {
  const isEditing = !!initialData?.id;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? `Edit Room ${initialData?.room_number}` : 'Add Physical Room'}
      description="Register a physical room number, assign its category, and set initial operational status."
    >
      <RoomForm
        key={initialData?.id || 'new-room'}
        propertyId={propertyId}
        currency={currency}
        roomTypes={roomTypes}
        initialData={initialData}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}
