import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  CreditCard,
  Network,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import {
  getPlatformMetricsAction,
  getPlatformTenantsAction,
  getPlatformSyncLogsAction,
} from '@/lib/actions/platform-admin';

export const metadata: Metadata = {
  title: 'Platform Overview — StayPilot Super Admin',
  description: 'Multi-tenant hotel management platform operator metrics and health monitor.',
};

export default async function AdminDashboardPage() {
  const [metrics, tenants, syncLogs] = await Promise.all([
    getPlatformMetricsAction(),
    getPlatformTenantsAction(),
    getPlatformSyncLogsAction(10),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              StayPilot Control Plane
            </h1>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
              Super Admin Mode
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Real-time platform health, multi-tenant hotel accounts, OTA sync metrics, and operational alerts.
          </p>
        </div>

        <Link
          href="/platform-admin/hotels"
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Building2 className="h-4 w-4" />
          <span>Manage Hotel Tenants</span>
        </Link>
      </div>

      {/* Metrics Row (Real counts, no fabrication) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Hotel Businesses</span>
            <Building2 className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">{metrics.totalTenants}</p>
          <span className="text-[11px] text-zinc-500">
            Across {metrics.totalProperties} physical properties
          </span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Active Subscriptions</span>
            <CreditCard className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.activeSubscriptions}
          </p>
          <span className="text-[11px] text-zinc-500">SaaS contracts in active billing</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Connected OTA Channels</span>
            <Network className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.connectedChannels}
          </p>
          <span className="text-[11px] text-zinc-500">Live 2-way bilateral sync pipelines</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Sync Success Rate</span>
            <Activity className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.syncSuccessRate}%
          </p>
          <span className="text-[11px] text-zinc-500">
            {metrics.pendingAlerts > 0
              ? `${metrics.pendingAlerts} alerts requiring operator review`
              : 'Zero active sync alerts'}
          </span>
        </div>
      </div>

      {/* Two Column Grid: Hotel Businesses & Real-Time Sync Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotel Tenants Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Registered Hotel Accounts</h2>
              <p className="text-xs text-zinc-400">Active tenant businesses using StayPilot.</p>
            </div>
            <Link
              href="/platform-admin/hotels"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All ({tenants.length})</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {tenants.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center space-y-2">
              <Building2 className="mx-auto h-7 w-7 text-zinc-600" />
              <p className="text-xs font-medium text-zinc-300">No hotel business accounts registered</p>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                When new hotels sign up for StayPilot Channel Manager, their tenant profile and property quotas will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-900">
              {tenants.slice(0, 5).map((tenant) => (
                <div key={tenant.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <Link
                      href={`/platform-admin/hotels/${tenant.id}`}
                      className="font-bold text-white hover:text-amber-400 transition-colors"
                    >
                      {tenant.name}
                    </Link>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {tenant.propertyCount} properties • Tier: {tenant.subscription_tier}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      tenant.subscription_status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tenant.subscription_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Sync Activity Stream */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Global Sync Stream</h2>
              <p className="text-xs text-zinc-400">Real-time inventory and rate transmission logs.</p>
            </div>
            <Link
              href="/platform-admin/sync-monitor"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Sync Monitor</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {syncLogs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center space-y-2">
              <Activity className="mx-auto h-7 w-7 text-zinc-600" />
              <p className="text-xs font-medium text-zinc-300">No cross-platform sync events</p>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                Sync logs from MakeMyTrip, Goibibo, Agoda, and Booking.com across all tenant hotels will stream here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-900">
              {syncLogs.slice(0, 5).map((log) => {
                const isSuccess = log.status === 'success';
                return (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white capitalize">
                          {log.channel.replace('_', '.')}
                        </span>
                        <span className="rounded-sm bg-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-300 uppercase">
                          {log.sync_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-xs">
                        {log.error_message || `Synced ${log.items_synced} units`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isSuccess
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">
                        {log.duration_ms ? `${log.duration_ms}ms` : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
