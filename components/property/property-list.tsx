'use client';

import * as React from 'react';
import { Property } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Mail, Phone, Clock, Edit, Check } from 'lucide-react';

interface PropertyListProps {
  properties: (Property & { role?: string })[];
  currentProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onEditProperty: (property: Property) => void;
  onAddNew: () => void;
}

export function PropertyList({
  properties,
  currentProperty,
  onSelectProperty,
  onEditProperty,
  onAddNew,
}: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <Card className="border-dashed border-zinc-300 p-8 text-center bg-zinc-50/50">
        <div className="flex flex-col items-center max-w-sm mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3 border border-blue-200">
            <Building className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">No properties found</h3>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
            You do not currently manage any properties in StayPilot. Complete the setup form below to register your first hotel establishment.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={onAddNew}
            className="mt-4"
          >
            Create Your First Property
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Your Managed Properties</h3>
          <p className="text-xs text-zinc-500">
            Switch active workspace or modify individual property configurations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onAddNew}>
          Add Another Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map((prop) => {
          const isSelected = currentProperty?.id === prop.id;
          return (
            <Card
              key={prop.id}
              className={`transition-all border ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-xs'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-900">
                          {prop.name}
                        </h4>
                        {isSelected && (
                          <Badge variant="info" className="text-[10px]">
                            Active
                          </Badge>
                        )}
                        {prop.role && (
                          <Badge variant="secondary" className="capitalize text-[10px]">
                            {prop.role}
                          </Badge>
                        )}
                      </div>
                      <p className="flex items-center gap-1 mt-0.5 text-xs text-zinc-500">
                        <MapPin className="h-3 w-3 shrink-0 text-zinc-400" />
                        <span>
                          {prop.city}, {prop.state}, {prop.country}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-zinc-600 border-t border-zinc-100 pt-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{prop.contact_email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{prop.contact_phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>In: {prop.check_in_time} / Out: {prop.check_out_time}</span>
                  </div>
                  <div className="font-mono text-zinc-500">
                    Currency: <span className="font-semibold text-zinc-800">{prop.currency}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-100 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditProperty(prop)}
                    className="text-xs h-8"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Details
                  </Button>

                  {!isSelected && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSelectProperty(prop)}
                      className="text-xs h-8"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Select Property
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
