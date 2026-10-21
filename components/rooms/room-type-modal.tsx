'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { RoomType, ActionResponse } from '@/types';
import { createRoomTypeAction, updateRoomTypeAction } from '@/lib/actions/room';
import { Check } from 'lucide-react';

interface RoomTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  currency?: string;
  initialData?: RoomType | null;
  onSuccess: (roomType: RoomType) => void;
}

const COMMON_AMENITIES = [
  'Air Conditioning',
  'King Bed',
  'Queen Bed',
  'Twin Beds',
  'Free Wi-Fi',
  'Balcony / Terrace',
  'Ocean / Mountain View',
  'Bathtub',
  'Smart TV',
  'Minibar',
  'Work Desk',
  'Safety Vault',
  'Tea & Coffee Maker',
  'Room Service',
  'Jacuzzi',
];

function RoomTypeForm({
  propertyId,
  currency,
  initialData,
  onOpenChange,
  onSuccess,
}: {
  propertyId: string;
  currency: string;
  initialData?: RoomType | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (roomType: RoomType) => void;
}) {
  const isEditing = !!initialData?.id;

  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ActionResponse<RoomType> | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    max_adults: initialData?.max_adults || 2,
    max_children: initialData?.max_children || 0,
    bed_configuration: initialData?.bed_configuration || '1 King Bed',
    base_rate: initialData?.base_rate || 3500,
    amenities: initialData?.amenities || ['Air Conditioning', 'Free Wi-Fi', 'Smart TV'],
    is_active: initialData?.is_active ?? true,
  });

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setFieldErrors({});

    const data = new FormData();
    data.append('property_id', propertyId);
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('max_adults', String(formData.max_adults));
    data.append('max_children', String(formData.max_children));
    data.append('bed_configuration', formData.bed_configuration);
    data.append('base_rate', String(formData.base_rate));
    data.append('amenities', JSON.stringify(formData.amenities));
    data.append('is_active', String(formData.is_active));

    try {
      let res: ActionResponse<RoomType>;
      if (isEditing && initialData?.id) {
        res = await updateRoomTypeAction(initialData.id, null, data);
      } else {
        res = await createRoomTypeAction(null, data);
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

      {/* Room Type Name */}
      <div className="space-y-1.5">
        <Label htmlFor="rt-name" required>
          Category Name
        </Label>
        <Input
          id="rt-name"
          placeholder="e.g. Deluxe Heritage Suite"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={!!fieldErrors.name}
          required
        />
        {fieldErrors.name && (
          <p className="text-[11px] text-rose-600">{fieldErrors.name[0]}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="rt-desc">Description</Label>
        <textarea
          id="rt-desc"
          rows={2}
          className="w-full rounded-lg border border-zinc-300 p-2 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          placeholder="Spacious room featuring traditional Rajasthani architecture with courtyard view."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        {fieldErrors.description && (
          <p className="text-[11px] text-rose-600">{fieldErrors.description[0]}</p>
        )}
      </div>

      {/* Capacities & Pricing */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rt-adults" required>
            Max Adults
          </Label>
          <Input
            id="rt-adults"
            type="number"
            min={1}
            max={20}
            value={formData.max_adults}
            onChange={(e) =>
              setFormData({ ...formData, max_adults: parseInt(e.target.value) || 1 })
            }
            error={!!fieldErrors.max_adults}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rt-children">Max Children</Label>
          <Input
            id="rt-children"
            type="number"
            min={0}
            max={15}
            value={formData.max_children}
            onChange={(e) =>
              setFormData({ ...formData, max_children: parseInt(e.target.value) || 0 })
            }
            error={!!fieldErrors.max_children}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rt-rate" required>
            Base Rate ({currency})
          </Label>
          <Input
            id="rt-rate"
            type="number"
            min={0}
            step="1"
            value={formData.base_rate}
            onChange={(e) =>
              setFormData({ ...formData, base_rate: parseFloat(e.target.value) || 0 })
            }
            error={!!fieldErrors.base_rate}
            required
          />
        </div>
      </div>

      {/* Bed Configuration */}
      <div className="space-y-1.5">
        <Label htmlFor="rt-bed">Bedding Setup</Label>
        <Input
          id="rt-bed"
          placeholder="e.g. 1 King Bed or 2 Twin Beds"
          value={formData.bed_configuration}
          onChange={(e) =>
            setFormData({ ...formData, bed_configuration: e.target.value })
          }
        />
      </div>

      {/* Amenities Selection Chips */}
      <div className="space-y-1.5">
        <Label>Included Room Amenities</Label>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border border-zinc-200 rounded-lg bg-zinc-50/50">
          {COMMON_AMENITIES.map((amenity) => {
            const isSelected = formData.amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {isSelected && <Check className="h-3 w-3" />}
                <span>{amenity}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Status Toggle */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="rt-active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="rt-active" className="cursor-pointer font-normal text-zinc-700">
          Active category (eligible for inventory assignment &amp; room calendar)
        </Label>
      </div>

      {/* Submit Actions */}
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
          {isEditing ? 'Save Changes' : 'Create Room Type'}
        </Button>
      </div>
    </form>
  );
}

export function RoomTypeModal({
  open,
  onOpenChange,
  propertyId,
  currency = 'INR',
  initialData,
  onSuccess,
}: RoomTypeModalProps) {
  const isEditing = !!initialData?.id;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Room Type' : 'Create New Room Type'}
      description="Configure room category capacities, baseline pricing, and standard guest amenities."
    >
      <RoomTypeForm
        key={initialData?.id || 'new-type'}
        propertyId={propertyId}
        currency={currency}
        initialData={initialData}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}
