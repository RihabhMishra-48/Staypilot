'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { createPropertyAction, updatePropertyAction } from '@/lib/actions/property';
import { Property, ActionResponse } from '@/types';
import { Building, Save, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PropertyFormProps {
  initialData?: Property | null;
  onSuccess?: (property: Property) => void;
}

export function PropertyForm({ initialData, onSuccess }: PropertyFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ActionResponse<Property> | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  // Form State
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || 'India',
    timezone: initialData?.timezone || 'Asia/Kolkata',
    currency: initialData?.currency || 'INR',
    check_in_time: initialData?.check_in_time || '14:00',
    check_out_time: initialData?.check_out_time || '11:00',
    contact_email: initialData?.contact_email || '',
    contact_phone: initialData?.contact_phone || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setFieldErrors({});

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, val);
    });

    try {
      let res: ActionResponse<Property>;
      if (isEditing && initialData?.id) {
        res = await updatePropertyAction(initialData.id, null, data);
      } else {
        res = await createPropertyAction(null, data);
      }

      setResult(res);

      if (res.errors) {
        setFieldErrors(res.errors);
      }

      if (res.success && res.data) {
        if (onSuccess) {
          onSuccess(res.data);
        }
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setResult({
        success: false,
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-zinc-200/90 shadow-2xs max-w-4xl">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Building className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-zinc-900">
              {isEditing ? 'Edit Property Profile' : 'Register New Hotel / Property'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isEditing
                ? 'Update your property contact details, operational timings, and localization.'
                : 'Configure your establishment in StayPilot. You will automatically be granted Owner rights.'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Message */}
          {result && !result.success && (
            <Alert variant="error" title="Operation Failed">
              {result.message}
            </Alert>
          )}

          {result && result.success && (
            <Alert variant="success" title="Success">
              {result.message}
            </Alert>
          )}

          {/* SECTION 1: General Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-1">
              General Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="name" required>
                  Property / Hotel Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Grand Palace Hotel & Resort"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!fieldErrors.name}
                  required
                />
                {fieldErrors.name && (
                  <p className="text-[11px] text-rose-600">{fieldErrors.name[0]}</p>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address" required>
                  Street Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="e.g. 14 Fort Palace Road, Near Lake View"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!fieldErrors.address}
                  required
                />
                {fieldErrors.address && (
                  <p className="text-[11px] text-rose-600">{fieldErrors.address[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" required>
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="e.g. Udaipur"
                  value={formData.city}
                  onChange={handleChange}
                  error={!!fieldErrors.city}
                  required
                />
                {fieldErrors.city && (
                  <p className="text-[11px] text-rose-600">{fieldErrors.city[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" required>
                  State / Province
                </Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="e.g. Rajasthan"
                  value={formData.state}
                  onChange={handleChange}
                  error={!!fieldErrors.state}
                  required
                />
                {fieldErrors.state && (
                  <p className="text-[11px] text-rose-600">{fieldErrors.state[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country" required>
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  placeholder="India"
                  value={formData.country}
                  onChange={handleChange}
                  error={!!fieldErrors.country}
                  required
                />
                {fieldErrors.country && (
                  <p className="text-[11px] text-rose-600">{fieldErrors.country[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="timezone" required>
                  Time Zone
                </Label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT +08:00)</option>
                  <option value="Asia/Bangkok">Asia/Bangkok (ICT +07:00)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Localization & Timings */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-1">
              Operational Timings & Currency
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="currency" required>
                  Base Currency
                </Label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-mono"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                  <option value="AED">AED (د.إ UAE Dirham)</option>
                  <option value="THB">THB (฿ Thai Baht)</option>
                </select>
                {fieldErrors.currency && (
                  <p className="text-[11px] text-rose-600">{fieldErrors.currency[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="check_in_time" required>
                  Check-In Time (24h)
                </Label>
                <div className="relative">
                  <Input
                    id="check_in_time"
                    name="check_in_time"
                    type="text"
                    placeholder="14:00"
                    value={formData.check_in_time}
                    onChange={handleChange}
                    error={!!fieldErrors.check_in_time}
                    className="font-mono"
                    required
                  />
                  <Clock className="absolute right-2.5 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>
                {fieldErrors.check_in_time && (
                  <p className="text-[11px] text-rose-600">{fieldErrors.check_in_time[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="check_out_time" required>
                  Check-Out Time (24h)
                </Label>
                <div className="relative">
                  <Input
                    id="check_out_time"
                    name="check_out_time"
                    type="text"
                    placeholder="11:00"
                    value={formData.check_out_time}
                    onChange={handleChange}
                    error={!!fieldErrors.check_out_time}
                    className="font-mono"
                    required
                  />
                  <Clock className="absolute right-2.5 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>
                {fieldErrors.check_out_time && (
                  <p className="text-[11px] text-rose-600">{fieldErrors.check_out_time[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-1">
              Contact & Guest Communication
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact_email" required>
                  Front Desk / Reservation Email
                </Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  placeholder="reservations@vrindanivas.com"
                  value={formData.contact_email}
                  onChange={handleChange}
                  error={!!fieldErrors.contact_email}
                  required
                />
                {fieldErrors.contact_email && (
                  <p className="text-[11px] text-rose-600">{fieldErrors.contact_email[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact_phone" required>
                  Front Desk Phone
                </Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  error={!!fieldErrors.contact_phone}
                  required
                />
                {fieldErrors.contact_phone && (
                  <p className="text-[11px] text-rose-600">{fieldErrors.contact_phone[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <div className="text-[11px] text-zinc-500">
              Validated on server with Zod &amp; protected by Supabase RLS policies.
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? 'Save Changes' : 'Create Property'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
