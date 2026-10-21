'use client';

import * as React from 'react';
import { RoomType } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Layers, Users, Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';

interface RoomTypeListProps {
  roomTypes: RoomType[];
  currency?: string;
  onEditRoomType: (roomType: RoomType) => void;
  onAddNewType: () => void;
}

export function RoomTypeList({
  roomTypes,
  currency = 'INR',
  onEditRoomType,
  onAddNewType,
}: RoomTypeListProps) {
  return (
    <Card className="border-zinc-200/90 shadow-2xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-bold text-zinc-900">
              Configured Room Categories ({roomTypes.length})
            </CardTitle>
            <Badge variant="info">Phase 2 Live</Badge>
          </div>
          <CardDescription className="text-xs">
            Categories define capacity parameters, baseline nightly tariffs, and amenities for physical rooms.
          </CardDescription>
        </div>

        <Button variant="outline" size="sm" onClick={onAddNewType} className="text-xs shrink-0">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Room Category
        </Button>
      </CardHeader>

      <CardContent className="pt-0">
        {roomTypes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center bg-zinc-50/50">
            <div className="flex h-9 w-9 mx-auto items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-2 border border-blue-200">
              <Layers className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-zinc-800">No room categories created</h4>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
              Start by defining your first room category (e.g. Deluxe Room, Heritage Suite, Villa) to assign physical room numbers.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onAddNewType}
              className="mt-3 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Create Room Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roomTypes.map((type) => (
              <div
                key={type.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 leading-tight">
                      {type.name}
                    </h4>
                    {type.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 shrink-0">
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </div>

                  {type.description && (
                    <p className="mt-1 text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {type.description}
                    </p>
                  )}

                  <div className="mt-3 space-y-1.5 text-xs text-zinc-600 border-t border-zinc-100 pt-2.5">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[11px] text-zinc-500">Base Tariff:</span>
                      <span className="font-bold text-zinc-900">
                        {formatCurrency(type.base_rate, currency)}
                        <span className="text-[10px] text-zinc-400 font-normal"> / night</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Max Capacity:</span>
                      <span className="font-medium text-zinc-800 flex items-center gap-1">
                        <Users className="h-3 w-3 text-zinc-400" />
                        {type.max_adults} Adults
                        {type.max_children > 0 && `, ${type.max_children} Kids`}
                      </span>
                    </div>

                    {type.bed_configuration && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">Bedding:</span>
                        <span className="font-medium text-zinc-700 truncate max-w-[150px]">
                          {type.bed_configuration}
                        </span>
                      </div>
                    )}
                  </div>

                  {type.amenities && type.amenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {type.amenities.slice(0, 3).map((am) => (
                        <span
                          key={am}
                          className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 border border-zinc-200/60"
                        >
                          {am}
                        </span>
                      ))}
                      {type.amenities.length > 3 && (
                        <span className="rounded bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-400 border border-zinc-200/60 font-mono">
                          +{type.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditRoomType(type)}
                    className="h-7 px-2 text-[11px]"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit Category
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
