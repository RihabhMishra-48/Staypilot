'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Network,
  RefreshCw,
  Plus,
  Sliders,
  Layers,
} from 'lucide-react';
import { RoomType, ChannelSummary } from '@/types';
import { useHotelProperty } from './hotel-layout-client';
import { triggerChannelSyncAction } from '@/lib/actions/channel';

interface ChannelManagerMatrixProps {
  roomTypes: RoomType[];
  channelSummaries: ChannelSummary[];
}

export function ChannelManagerMatrixClient({
  roomTypes,
  channelSummaries,
}: ChannelManagerMatrixProps) {
  const { currentProperty } = useHotelProperty();
  const [isSyncingAll, setIsSyncingAll] = React.useState(false);
  const [notice, setNotice] = React.useState<{ text: string; error?: boolean } | null>(null);

  const connectedChannels = channelSummaries.filter(
    (c) => c.connection?.status === 'connected'
  );

  const handleSyncAll = async () => {
    if (!currentProperty) return;
    setIsSyncingAll(true);
    setNotice(null);

    if (connectedChannels.length === 0) {
      setNotice({
        text: 'Cannot synchronize: No OTAs are currently connected. Setup partner credentials first.',
        error: true,
      });
      setIsSyncingAll(false);
      return;
    }

    try {
      const results = await Promise.all(
        connectedChannels.map((c) =>
          triggerChannelSyncAction(currentProperty.id, c.channel, 'full')
        )
      );
      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        setNotice({
          text: `Sync completed with ${failed.length} warning(s). Check sync logs for details.`,
          error: true,
        });
      } else {
        setNotice({
          text: 'Successfully pushed latest rates and room availability to all connected channels.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bulk sync failed';
      setNotice({ text: msg, error: true });
    } finally {
      setIsSyncingAll(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Rate & Availability Distribution Matrix
            </h1>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              Unified Inventory
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Maintain master rates and distribute live availability across MakeMyTrip, Goibibo, Agoda, and Booking.com without double-booking risk.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/hotel/channel-manager/connections"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors"
          >
            <Network className="h-3.5 w-3.5 text-zinc-500" />
            <span>Channel Connections</span>
          </Link>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>Sync All Channels</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-lg p-3 text-xs flex items-center justify-between ${
            notice.error
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
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

      {/* Connected Channel Quick Badges */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-zinc-200 bg-white p-3 shadow-2xs text-xs">
        <span className="font-semibold text-zinc-700 mr-1">Distribution Targets:</span>
        {channelSummaries.map((summary) => {
          const isConnected = summary.connection?.status === 'connected';
          return (
            <div
              key={summary.channel}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 border text-xs ${
                isConnected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-500'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-600' : 'bg-zinc-400'
                }`}
              />
              <span>{summary.displayName}</span>
              <span className="text-[10px] text-zinc-400">
                ({isConnected ? 'Active' : 'Unlinked'})
              </span>
            </div>
          );
        })}
      </div>

      {/* Distribution Matrix Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Room Type Rate Mapping</h2>
            <p className="text-xs text-zinc-500">
              Master base rates in PMS mapped to channel-specific rate plans.
            </p>
          </div>
          <Link
            href="/hotel/room-types"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Manage Room Types</span>
          </Link>
        </div>

        {roomTypes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="text-xs font-semibold text-zinc-800">No room types configured in PMS</p>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
              Before mapping channel rates, create room types (e.g. Deluxe Suite, Executive King) with base rates and guest capacity.
            </p>
            <Link
              href="/hotel/room-types"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Room Type</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Room Type</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Base PMS Rate</th>
                  {channelSummaries.map((s) => (
                    <th key={s.channel} className="px-4 py-3 text-center">
                      {s.displayName}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {roomTypes.map((rt) => (
                  <tr key={rt.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-zinc-900">{rt.name}</p>
                      <p className="text-[10px] text-zinc-400">
                        {rt.bed_configuration || 'Standard Setup'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                      {rt.max_adults} Adults, {rt.max_children} Kids
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900 whitespace-nowrap">
                      ₹{rt.base_rate.toLocaleString()} / night
                    </td>

                    {/* Channel Mapping Cells */}
                    {channelSummaries.map((summary) => {
                      const isConnected = summary.connection?.status === 'connected';
                      return (
                        <td key={summary.channel} className="px-4 py-3 text-center">
                          {isConnected ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                              Synced (100%)
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400 italic">
                              Unlinked
                            </span>
                          )}
                        </td>
                      );
                    })}

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/hotel/channel-manager/connections`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <Sliders className="h-3 w-3" />
                        <span>Map OTA Rates</span>
                      </Link>
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
