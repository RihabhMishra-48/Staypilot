import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Server,
} from 'lucide-react';
import Link from 'next/link';

interface FuturePhasePlaceholderProps {
  phase: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  plannedFeatures: string[];
  architecturalFoundation: string[];
}

export function FuturePhasePlaceholder({
  phase,
  title,
  description,
  icon: Icon,
  plannedFeatures,
  architecturalFoundation,
}: FuturePhasePlaceholderProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header Banner */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-white to-zinc-50 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="info" className="font-semibold text-[11px]">
                  <Clock className="h-3 w-3 mr-1" />
                  {phase} Roadmap
                </Badge>
                <span className="text-xs text-zinc-500 font-medium">
                  StayPilot Architectural Plan
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                {title}
              </h1>
              <p className="mt-1 text-xs text-zinc-600 max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="self-start sm:self-center">
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center text-xs shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Module Status
              </span>
              <span className="font-semibold text-zinc-800">
                Coming in a future phase
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Planned Features & Foundation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Planned Features */}
        <Card className="border-zinc-200 shadow-xs">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Planned Capabilities</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Key operational features scheduled for this upcoming release.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3">
              {plannedFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700">
                  <div className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Phase 1 Foundation Ready */}
        <Card className="border-zinc-200 shadow-xs">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-sm">Phase 1 Prerequisite Groundwork</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Database models and access controls already implemented in Phase 1 to support this module.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3">
              {architecturalFoundation.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Navigation action to real active Phase 1 features */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <Server className="h-4 w-4 text-zinc-400 shrink-0" />
          <span>
            Explore operational Phase 1 features: <strong>Overview Dashboard</strong> and <strong>Property Configuration</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 transition-colors shadow-2xs"
          >
            <span>Overview Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
          </Link>
          <Link
            href="/dashboard/settings/property"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs"
          >
            <span>Property Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
