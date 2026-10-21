import * as React from 'react';
import { Metadata } from 'next';
import { CreditCard } from 'lucide-react';
import { getPlatformTenantsAction } from '@/lib/actions/platform-admin';

export const metadata: Metadata = {
  title: 'Subscriptions & Billing — StayPilot Super Admin',
  description: 'Manage SaaS customer subscription contracts and billing tiers.',
};

export default async function PlatformSubscriptionsPage() {
  const tenants = await getPlatformTenantsAction();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Tenant Subscriptions &amp; Billing
          </h1>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            SaaS Contracts
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Monitor recurring hotel subscription contracts, renewal dates, and payment health.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm overflow-hidden">
        {tenants.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CreditCard className="mx-auto h-8 w-8 text-zinc-700" />
            <p className="text-xs font-semibold text-zinc-300">No subscription contracts found</p>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
              Active subscriptions will appear here when hotel businesses enroll in StayPilot Channel Manager.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Tenant Business</th>
                  <th className="px-4 py-3">Billing Contact</th>
                  <th className="px-4 py-3">Plan Tier</th>
                  <th className="px-4 py-3">Property Quota</th>
                  <th className="px-4 py-3">Billing Status</th>
                  <th className="px-4 py-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-bold text-white">{t.name}</td>
                    <td className="px-4 py-3 text-zinc-400">{t.billing_email || '—'}</td>
                    <td className="px-4 py-3 uppercase text-amber-400 font-semibold text-[10px]">
                      {t.subscription_tier}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {t.propertyCount} of {t.max_properties}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          t.subscription_status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {t.subscription_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
