import * as React from 'react';
import { Metadata } from 'next';
import { CreditCard, Check, Building2, Radio, Shield } from 'lucide-react';
import { getUserProperties } from '@/lib/actions/property';
import { createClient } from '@/lib/supabase/server';
import { Organization } from '@/types';

export const metadata: Metadata = {
  title: 'SaaS Plan & Billing — StayPilot',
  description: 'Manage StayPilot Channel Manager SaaS subscription, property quota, and connected channel tiers.',
};

export default async function HotelBillingPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  let organization: Organization | null = null;
  if (currentProperty?.organization_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', currentProperty.organization_id)
      .single();
    organization = data as Organization | null;
  }

  const currentTier = organization?.subscription_tier || 'starter';
  const status = organization?.subscription_status || 'active';
  const maxProperties = organization?.max_properties || 3;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="border-b border-zinc-200/80 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            SaaS Subscription &amp; Quotas
          </h1>
          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 uppercase">
            {currentTier} Plan
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Manage your StayPilot Channel Manager subscription, authorized properties, and billing profile.
        </p>
      </div>

      {/* Current Plan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Subscription Status</span>
            <Shield className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-900 capitalize">{status}</span>
          </div>
          <p className="text-[11px] text-zinc-500">Full 2-way OTA synchronization active</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Property Quota</span>
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-900">
              {properties.length} / {maxProperties}
            </span>
            <span className="text-xs text-zinc-500">Properties</span>
          </div>
          <p className="text-[11px] text-zinc-500">Multi-property allocation under your account</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Supported OTAs</span>
            <Radio className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-900">Unlimited</span>
          </div>
          <p className="text-[11px] text-zinc-500">MakeMyTrip, Goibibo, Agoda, Booking.com</p>
        </div>
      </div>

      {/* Available Plans Comparison */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Available SaaS Plans</h2>
          <p className="text-xs text-zinc-500">Select the tier that fits your hotel or resort inventory size.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Starter */}
          <div
            className={`rounded-xl border p-5 shadow-2xs flex flex-col justify-between space-y-4 ${
              currentTier === 'starter'
                ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20'
                : 'border-zinc-200 bg-white'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-zinc-900">Starter</span>
                {currentTier === 'starter' && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-zinc-900">₹2,999</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <p className="text-xs text-zinc-500">For standalone boutique hotels and guest houses.</p>

              <ul className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Up to 1 Property</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Full 2-Way OTA Synchronization</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Standard Room Inventory PMS</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Growth */}
          <div
            className={`rounded-xl border p-5 shadow-2xs flex flex-col justify-between space-y-4 ${
              currentTier === 'growth'
                ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20'
                : 'border-zinc-200 bg-white'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-zinc-900">Growth</span>
                {currentTier === 'growth' && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-zinc-900">₹5,999</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <p className="text-xs text-zinc-500">For independent hotels and multi-room resorts.</p>

              <ul className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Up to 3 Properties</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Sub-minute Real-Time Sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Staff Permissions &amp; Shifts</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro */}
          <div
            className={`rounded-xl border p-5 shadow-2xs flex flex-col justify-between space-y-4 ${
              currentTier === 'pro'
                ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20'
                : 'border-zinc-200 bg-white'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-zinc-900">Enterprise</span>
                {currentTier === 'pro' && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-zinc-900">Custom</span>
              </div>
              <p className="text-xs text-zinc-500">For hotel chains, groups, and multi-location management.</p>

              <ul className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Unlimited Properties</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Dedicated Connectivity Architect</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Custom Rate Plan Multipliers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
