import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Hotel,
  ArrowRight,
  ShieldCheck,
  Building,
  Layers,
  Database,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="border-b border-zinc-200/80 bg-white/95 sticky top-0 z-30 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Hotel className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-zinc-900 leading-tight">
                StayPilot
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Hotel OS &amp; Channel Manager
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/hotel/dashboard">
              <Button variant="primary" size="sm" className="text-xs font-semibold gap-1.5">
                <span>Enter Channel Manager</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-3 py-1 text-xs font-semibold text-blue-700">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600" />
            B2B SaaS • Multi-Tenant Channel Manager &amp; PMS
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-[1.15]">
            Hotel Channel Manager &amp; PMS Platform.
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl">
            StayPilot is a B2B SaaS platform engineered for hotels, guest houses, and resorts. Direct bilateral synchronization for MakeMyTrip, Goibibo, Agoda, and Booking.com with unified room inventory and rate management.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/hotel/dashboard">
              <Button variant="primary" size="lg" className="text-xs font-semibold gap-2 shadow-xs">
                <span>Launch Channel Manager</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/hotel/channel-manager/connections">
              <Button variant="outline" size="lg" className="text-xs font-semibold gap-2">
                <Building className="h-4 w-4 text-zinc-500" />
                <span>Configure OTA Connections</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Phase Breakdown Grid */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                Phase 1 Active
              </span>
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              Core Architecture &amp; RLS
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Multi-tenant properties, profiles, and member roles (Owner, Manager, Receptionist, Housekeeping) enforced by non-recursive Row Level Security.
            </p>
            <ul className="text-xs text-zinc-600 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Persistent 14-item navigation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Zod server &amp; client validation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Executive overview dashboard</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 uppercase tracking-wider">
                Phase 2 &amp; 3 Next
              </span>
              <Layers className="h-5 w-5 text-zinc-500" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              PMS Inventory &amp; Front Desk
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Interactive Room Calendar, Room Types, rates &amp; availability, express lobby check-in, guest folios, and housekeeping status queues.
            </p>
            <ul className="text-xs text-zinc-600 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span>Tape chart room matrix</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span>Concurrency-safe booking engine</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span>Digital identity document vault</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 uppercase tracking-wider">
                Phase 4 &amp; 5
              </span>
              <Lock className="h-5 w-5 text-zinc-500" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              OTA Sync &amp; Direct Engine
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Two-way XML/JSON synchronization for MakeMyTrip, Goibibo, Agoda, Booking.com, plus direct commission-free booking website.
            </p>
            <ul className="text-xs text-zinc-600 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span>Certified OTA ARI connections</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span>Instant rate parity sync</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span>Razorpay, Stripe &amp; UPI checkout</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-zinc-50 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-zinc-800">StayPilot Hospitality Systems</span>
          </div>
          <div>
            Built with Next.js App Router, TypeScript, Tailwind CSS &amp; Supabase PostgreSQL.
          </div>
        </div>
      </footer>
    </div>
  );
}
