import * as React from 'react';
import { Metadata } from 'next';
import { Check } from 'lucide-react';
import { SubscriptionPlan } from '@/types';

export const metadata: Metadata = {
  title: 'Subscription Plans — StayPilot Super Admin',
  description: 'Manage SaaS commercial pricing plans and property quotas.',
};

const PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    tier: 'starter',
    name: 'Starter Tier',
    pricePerMonth: 2999,
    maxProperties: 1,
    maxChannels: 4,
    features: [
      '1 Hotel Property',
      'MakeMyTrip & Goibibo 2-Way Sync',
      'Agoda & Booking.com Connectivity',
      'Physical Room Inventory PMS',
      'Tape Chart Calendar',
    ],
  },
  {
    id: 'growth',
    tier: 'growth',
    name: 'Growth Tier',
    pricePerMonth: 5999,
    maxProperties: 3,
    maxChannels: 4,
    isPopular: true,
    features: [
      'Up to 3 Hotel Properties',
      'Sub-minute Real-Time Sync',
      'All 4 OTA Bilateral Connectors',
      'Role-Based Staff Permissions',
      'Audit Trail & History',
    ],
  },
  {
    id: 'pro',
    tier: 'pro',
    name: 'Pro Tier',
    pricePerMonth: 9999,
    maxProperties: 10,
    maxChannels: 4,
    features: [
      'Up to 10 Hotel Properties',
      'Dedicated API Rate Allocations',
      'High Priority Sync Queue',
      'Automated Rate Multipliers',
      'Enterprise SLA Guarantee',
    ],
  },
  {
    id: 'enterprise',
    tier: 'enterprise',
    name: 'Enterprise Tier',
    pricePerMonth: 19999,
    maxProperties: 50,
    maxChannels: 4,
    features: [
      'Unlimited Properties',
      'Custom OTA Gateway Endpoints',
      'Dedicated Technical Account Manager',
      'Custom Channel Integrations',
      '24/7 Priority Emergency Support',
    ],
  },
];

export default function PlatformPlansPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Subscription Plans &amp; Quotas
          </h1>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            SaaS Catalog
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Commercial pricing tiers, property quotas, and feature allocations for StayPilot B2B customers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-5 shadow-sm flex flex-col justify-between space-y-4 ${
              plan.isPopular
                ? 'border-amber-500 bg-zinc-950 ring-1 ring-amber-500/30'
                : 'border-zinc-800 bg-zinc-950'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{plan.name}</span>
                {plan.isPopular && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-zinc-950 uppercase">
                    Popular
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">
                  ₹{plan.pricePerMonth.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-400">/ mo</span>
              </div>

              <div className="py-2 border-y border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Max Properties:</span>
                  <span className="font-semibold text-white">{plan.maxProperties}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Max Channels:</span>
                  <span className="font-semibold text-white">{plan.maxChannels}</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-zinc-400 pt-1">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
