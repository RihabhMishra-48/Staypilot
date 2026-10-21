'use client';

import * as React from 'react';
import { useHotelProperty } from '@/components/hotel/hotel-layout-client';
import { PropertyForm } from '@/components/property/property-form';
import { PropertyList } from '@/components/property/property-list';
import { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function HotelSettingsPage() {
  const { currentProperty, setCurrentProperty, properties } = useHotelProperty();

  const [mode, setMode] = React.useState<'list' | 'create' | 'edit'>('list');
  const [editingProperty, setEditingProperty] = React.useState<Property | null>(null);

  const handleEdit = (prop: Property) => {
    setEditingProperty(prop);
    setMode('edit');
  };

  const handleAddNew = () => {
    setEditingProperty(null);
    setMode('create');
  };

  const handleSuccess = (updatedProp: Property) => {
    setCurrentProperty(updatedProp);
    setMode('list');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Property &amp; Hotel Configuration
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Manage physical establishment settings, check-in policies, currency, and multi-property access.
          </p>
        </div>

        {mode !== 'list' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode('list')}
            className="self-start sm:self-center"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Properties
          </Button>
        )}
      </div>

      {/* Content depending on mode */}
      {mode === 'list' && (
        <div className="space-y-8">
          <PropertyList
            properties={properties}
            currentProperty={currentProperty}
            onSelectProperty={setCurrentProperty}
            onEditProperty={handleEdit}
            onAddNew={handleAddNew}
          />

          {currentProperty && (
            <div className="pt-4 border-t border-zinc-200">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-zinc-900">
                  Active Property Settings: {currentProperty.name}
                </h3>
                <p className="text-xs text-zinc-500">
                  Directly edit details for the currently active hotel.
                </p>
              </div>
              <PropertyForm
                key={currentProperty.id}
                initialData={currentProperty}
                onSuccess={handleSuccess}
              />
            </div>
          )}
        </div>
      )}

      {mode === 'create' && (
        <div className="space-y-4">
          <PropertyForm onSuccess={handleSuccess} />
        </div>
      )}

      {mode === 'edit' && editingProperty && (
        <div className="space-y-4">
          <PropertyForm
            key={editingProperty.id}
            initialData={editingProperty}
            onSuccess={handleSuccess}
          />
        </div>
      )}
    </div>
  );
}
