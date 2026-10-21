'use client';

import * as React from 'react';
import { History, CheckCircle2, XCircle, Filter, RefreshCw } from 'lucide-react';
import { ChannelSyncLog } from '@/types';
import { useHotelProperty } from './hotel-layout-client';
import { getPropertySyncLogs } from '@/lib/actions/channel';

interface ChannelSyncLogsClientProps {
  initialLogs: ChannelSyncLog[];
}

export function ChannelSyncLogsClient({ initialLogs }: ChannelSyncLogsClientProps) {
  const { currentProperty } = useHotelProperty();
  const [logs, setLogs] = React.useState<ChannelSyncLog[]>(initialLogs);
  const [selectedChannel, setSelectedChannel] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (!currentProperty) return;
    setIsRefreshing(true);
    try {
      const fresh = await getPropertySyncLogs(currentProperty.id, 50);
      setLogs(fresh);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedChannel !== 'all' && log.channel !== selectedChannel) return false;
    if (selectedStatus !== 'all' && log.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Channel Synchronization Logs</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Complete immutable audit log of inventory pushes, rate plan updates, and reservation transmissions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mr-2">
          <Filter className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium">Filter By:</span>
        </div>

        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-800"
        >
          <option value="all">All Channels</option>
          <option value="makemytrip">MakeMyTrip</option>
          <option value="goibibo">Goibibo</option>
          <option value="agoda">Agoda</option>
          <option value="booking_com">Booking.com</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-800"
        >
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <History className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="text-xs font-semibold text-zinc-800">No synchronization logs recorded</p>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
              Synchronization logs are automatically written when rates or availability change, or when an OTA integration handshake executes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Sync Type</th>
                  <th className="px-4 py-3">Direction</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Details / Errors</th>
                  <th className="px-4 py-3 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLogs.map((log) => {
                  const isSuccess = log.status === 'success';
                  return (
                    <tr key={log.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-900 capitalize whitespace-nowrap">
                        {log.channel.replace('_', '.')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 uppercase">
                          {log.sync_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 uppercase text-[10px] font-medium whitespace-nowrap">
                        {log.direction}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isSuccess ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Success</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 text-rose-600" />
                              <span>Failure</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-700 max-w-md">
                        {log.error_message ? (
                          <span className="text-rose-600 font-medium block truncate">
                            {log.error_message}
                          </span>
                        ) : (
                          <span className="text-zinc-600">
                            Synchronized {log.items_synced} room units / rate updates
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[11px] text-zinc-500 whitespace-nowrap">
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
