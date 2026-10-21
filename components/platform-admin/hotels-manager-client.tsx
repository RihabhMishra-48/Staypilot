'use client';

import * as React from 'react';
import Link from 'next/link';
import { Building2, Search, Power, ArrowUpRight } from 'lucide-react';
import { Organization, SubscriptionStatus } from '@/types';
import { updateTenantStatusAction } from '@/lib/actions/platform-admin';

interface HotelsManagerClientProps {
  initialTenants: (Organization & { propertyCount: number })[];
}

export function HotelsManagerClient({ initialTenants }: HotelsManagerClientProps) {
  const [tenants, setTenants] = React.useState(initialTenants);
  const [search, setSearch] = React.useState('');
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<{ text: string; error?: boolean } | null>(null);

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (tenant: Organization) => {
    const newStatus: SubscriptionStatus =
      tenant.subscription_status === 'active' ? 'suspended' : 'active';

    setUpdatingId(tenant.id);
    setNotice(null);

    try {
      const res = await updateTenantStatusAction(tenant.id, newStatus);
      if (res.success) {
        setTenants((prev) =>
          prev.map((t) =>
            t.id === tenant.id ? { ...t, subscription_status: newStatus } : t
          )
        );
        setNotice({ text: `${tenant.name} status updated to ${newStatus}` });
      } else {
        setNotice({ text: res.message, error: true });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Action failed';
      setNotice({ text: msg, error: true });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Hotel Business Accounts
            </h1>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
              Tenants Directory
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Activate, suspend, and inspect independent hotel businesses using StayPilot Channel Manager.
          </p>
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-lg p-3 text-xs flex items-center justify-between ${
            notice.error
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
          }`}
        >
          <span>{notice.text}</span>
          <button
            onClick={() => setNotice(null)}
            className="text-[11px] underline font-semibold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by hotel or business name..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Building2 className="mx-auto h-8 w-8 text-zinc-700" />
            <p className="text-xs font-semibold text-zinc-300">No hotel business accounts found</p>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
              Hotel accounts created during signup or via platform onboarding will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Business Name</th>
                  <th className="px-4 py-3">Properties</th>
                  <th className="px-4 py-3">Subscription Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Registered On</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filtered.map((tenant) => {
                  const isActive = tenant.subscription_status === 'active';
                  const isUpdating = updatingId === tenant.id;

                  return (
                    <tr key={tenant.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/platform-admin/hotels/${tenant.id}`}
                          className="font-bold text-white hover:text-amber-400 flex items-center gap-1.5"
                        >
                          <span>{tenant.name}</span>
                          <ArrowUpRight className="h-3 w-3 text-zinc-500" />
                        </Link>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                          slug: {tenant.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {tenant.propertyCount} / {tenant.max_properties}
                      </td>
                      <td className="px-4 py-3 uppercase font-semibold text-amber-400 text-[10px]">
                        {tenant.subscription_tier}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tenant.subscription_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleStatus(tenant)}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold border transition-colors ${
                            isActive
                              ? 'border-rose-800 text-rose-400 hover:bg-rose-950/40'
                              : 'border-emerald-800 text-emerald-400 hover:bg-emerald-950/40'
                          }`}
                        >
                          <Power className="h-3 w-3" />
                          <span>{isActive ? 'Suspend' : 'Activate'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
