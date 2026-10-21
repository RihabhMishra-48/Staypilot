import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { verifyPlatformAdmin } from '@/lib/auth/platform-admin';

export const metadata: Metadata = {
  title: 'Tenant Details — StayPilot Super Admin',
  description: 'Inspect hotel business tenant properties, membership, and subscription.',
};

export default async function HotelTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyPlatformAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const [orgRes, propsRes, membersRes] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', id).single(),
    supabase.from('properties').select('*').eq('organization_id', id),
    supabase
      .from('organization_members')
      .select('*, profile:profiles(*)')
      .eq('organization_id', id),
  ]);

  if (!orgRes.data) {
    notFound();
  }

  const org = orgRes.data;
  const properties = propsRes.data || [];
  const members = membersRes.data || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button & Header */}
      <div>
        <Link
          href="/platform-admin/hotels"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Hotel Accounts</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">{org.name}</h1>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 uppercase">
                {org.subscription_tier} Tier
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Tenant ID: {org.id}</p>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              org.subscription_status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {org.subscription_status}
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1">
          <span className="text-xs text-zinc-500">Properties Linked</span>
          <p className="text-xl font-bold text-white">
            {properties.length} / {org.max_properties}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1">
          <span className="text-xs text-zinc-500">Authorized Members</span>
          <p className="text-xl font-bold text-white">{members.length}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1">
          <span className="text-xs text-zinc-500">Billing Email</span>
          <p className="text-sm font-semibold text-zinc-200 truncate">
            {org.billing_email || 'Not specified'}
          </p>
        </div>
      </div>

      {/* Properties List */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-white">Affiliated Hotel Properties</h2>
          <p className="text-xs text-zinc-400">Physical hotel units managed under this tenant organization.</p>
        </div>

        {properties.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No properties registered under this account yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {properties.map((prop) => (
              <div key={prop.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">{prop.name}</p>
                  <p className="text-[11px] text-zinc-500">
                    {prop.city}, {prop.state}, {prop.country}
                  </p>
                </div>
                <div className="text-right text-[11px] text-zinc-400 font-mono">
                  {prop.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
