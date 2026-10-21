'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Room, OperationalStatus, ActionResponse } from '@/types';
import { updateRoomStatusAction } from '@/lib/actions/room';
import { CheckCircle2, Sparkles, Wrench, AlertTriangle, Lock } from 'lucide-react';

interface ChangeStatusModalProps {
  room: Room | null;
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updated: Room) => void;
}

const statusOptions: {
  status: OperationalStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    status: 'available',
    label: 'Available / Clean',
    description: 'Inspected and ready for guest check-in.',
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    status: 'cleaning',
    label: 'Cleaning in Progress',
    description: 'Housekeeping attendant currently servicing the room.',
    icon: Sparkles,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    status: 'dirty',
    label: 'Dirty / Turnover Needed',
    description: 'Guest checked out or scheduled daily refresh needed.',
    icon: AlertTriangle,
    color: 'text-amber-800 bg-amber-50 border-amber-200',
  },
  {
    status: 'maintenance',
    label: 'Maintenance Required',
    description: 'AC, plumbing, or electrical repairs ongoing.',
    icon: Wrench,
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  {
    status: 'out_of_service',
    label: 'Out of Service (OOS)',
    description: 'Temporarily blocked for renovation or deep sanitization.',
    icon: Lock,
    color: 'text-zinc-700 bg-zinc-100 border-zinc-200',
  },
];

function ChangeStatusForm({
  room,
  propertyId,
  onOpenChange,
  onSuccess,
}: {
  room: Room;
  propertyId: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updated: Room) => void;
}) {
  const [selectedStatus, setSelectedStatus] = React.useState<OperationalStatus>(
    room.operational_status
  );
  const [notes, setNotes] = React.useState(room.notes || '');
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ActionResponse<Room> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('property_id', propertyId);
    formData.append('room_id', room.id);
    formData.append('operational_status', selectedStatus);
    formData.append('notes', notes);

    try {
      const res = await updateRoomStatusAction(null, formData);
      setResult(res);
      if (res.success && res.data) {
        onSuccess(res.data);
        onOpenChange(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update operational status.';
      setResult({ success: false, message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result && !result.success && (
        <Alert variant="error" title="Update Failed">
          {result.message}
        </Alert>
      )}

      <div className="space-y-2">
        {statusOptions.map((opt) => {
          const isSelected = selectedStatus === opt.status;
          const Icon = opt.icon;
          return (
            <label
              key={opt.status}
              className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? `${opt.color} ring-2 ring-blue-500/20 font-medium`
                  : 'border-zinc-200 bg-white hover:bg-zinc-50'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={opt.status}
                checked={isSelected}
                onChange={() => setSelectedStatus(opt.status)}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{opt.label}</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-tight">
                  {opt.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status-note">Status Notes / Reason</Label>
        <input
          id="status-note"
          type="text"
          placeholder="e.g. AC cooling coil checked; ready for guest."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
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
          Save Status
        </Button>
      </div>
    </form>
  );
}

export function ChangeStatusModal({
  room,
  propertyId,
  open,
  onOpenChange,
  onSuccess,
}: ChangeStatusModalProps) {
  if (!room) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Update Operational Status: Room ${room.room_number}`}
      description="Record live room cleanliness or mark rooms for maintenance inspection."
    >
      <ChangeStatusForm
        key={`${room.id}-${room.operational_status}`}
        room={room}
        propertyId={propertyId}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}
