import * as React from 'react';
import { Metadata } from 'next';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';
import { getPlatformSyncLogsAction } from '@/lib/actions/platform-admin';

export const metadata: Metadata = {
  title: 'Global Sync Monitor — StayPilot Super Admin',
  description: 'Real-time synchronization failure diagnostics and operational alerts across all hotel properties.',
};

export default async function PlatformSyncMonitorPage() {
  const logs = await getPlatformSyncLogsAction(100);

  const failureCount = logs.filter((l) => l.status === 'failure').length;
  const successCount = logs.filter((l) => l.status === 'success').length;
  const avgDuration =
    logs.length > 0
      ? Math.round(
          logs.reduce((acc, curr) => acc + (curr.duration_ms || 0), 0) / logs.length
        )
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Global Sync Monitor &amp; Health
          </h1>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            Real-Time Engine
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Track latency, synchronization success rates, and gateway failure alerts across all tenant hotels.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1">
          <span className="text-xs text-zinc-500">Successful Syncs</span>
          <p className="text-2xl font-extrabold text-emerald-400">{successCount}</p>
          <span className="text-[10px] text-zinc-500">Rate and inventory updates delivered</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1">
          <span className="text-xs text-zinc-500">Sync Failures</span>
          <p className="text-2xl font-extrabold text-rose-400">{failureCount}</p>
          <span className="text-[10px] text-zinc-500">Gateway or credentials rejections</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1">
          <span className="text-xs text-zinc-500">Average Gateway Latency</span>
          <p className="text-2xl font-extrabold text-white">{avgDuration}ms</p>
          <span className="text-[10px] text-zinc-500">M2M round-trip duration</span>
        </div>
      </div>

      {/* Sync Stream Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-white">Platform-Wide Sync Transmission Stream</h2>
          <p className="text-xs text-zinc-400">Chronological feed of cross-property OTA updates.</p>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Activity className="mx-auto h-8 w-8 text-zinc-700" />
            <p className="text-xs font-semibold text-zinc-300">No sync operations recorded</p>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
              Live updates to room inventory or rate plans will trigger sync operations and log here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Property ID</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Sync Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Diagnostics</th>
                  <th className="px-4 py-3 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {logs.map((log) => {
                  const isSuccess = log.status === 'success';
                  return (
                    <tr key={log.id} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap truncate max-w-[120px]">
                        {log.property_id}
                      </td>
                      <td className="px-4 py-3 font-bold text-white capitalize whitespace-nowrap">
                        {log.channel.replace('_', '.')}
                      </td>
                      <td className="px-4 py-3 uppercase text-[10px] text-zinc-400 whitespace-nowrap">
                        {log.sync_type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {isSuccess ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 max-w-sm truncate">
                        {log.error_message || `Transmitted ${log.items_synced} units`}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {log.duration_ms ? `${log.duration_ms}ms` : '—'}
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
