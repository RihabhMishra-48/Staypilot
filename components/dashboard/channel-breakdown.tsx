import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookingSourceStat } from '@/types';
import { Share2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface ChannelBreakdownProps {
  sources: BookingSourceStat[];
}

export function ChannelBreakdown({ sources }: ChannelBreakdownProps) {
  return (
    <Card className="border-zinc-200/90 shadow-2xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
        <div>
          <CardTitle className="text-sm font-bold text-zinc-900">
            Booking Source Distribution
          </CardTitle>
          <CardDescription className="text-xs">
            Direct website vs. Online Travel Agencies (OTAs).
          </CardDescription>
        </div>

        <Link
          href="/dashboard/channel-manager"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>Channel Integrations</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="pt-1 space-y-4">
        {sources.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <p className="text-xs font-semibold text-zinc-700">No channel bookings recorded yet</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Multi-channel booking distribution will calculate automatically as reservations arrive.
            </p>
          </div>
        ) : (
          <>
            {/* Stacked multi-color progress bar */}
            <div className="h-3 w-full rounded-full bg-zinc-100 flex overflow-hidden p-0.5 border border-zinc-200/60">
              {sources.map((src) => (
                <div
                  key={src.channel}
                  style={{
                    width: `${src.percentage}%`,
                    backgroundColor: src.color,
                  }}
                  title={`${src.channel}: ${src.percentage}%`}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                />
              ))}
            </div>

            {/* Breakdown List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {sources.map((src) => (
            <div
              key={src.channel}
              className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/60 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: src.color }}
                />
                <span className="font-medium text-zinc-800">{src.channel}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-semibold text-zinc-900">{src.percentage}%</span>
                <span className="text-[10px] text-zinc-400">
                  ({src.bookings} bks)
                </span>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
      </CardContent>
    </Card>
  );
}
