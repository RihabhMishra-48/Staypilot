'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Organization } from '@/types';
import {
  SlidersHorizontal,
  ShieldCheck,
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Database,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface PlatformAdminClientProps {
  overview: {
    isAuthorized: boolean;
    metrics?: {
      totalTenants: number;
      activeTenants: number;
      suspendedTenants: number;
      totalProperties: number;
      tierBreakdown: Record<string, number>;
    };
    organizations?: Organization[];
    error?: string;
  };
  userOrganizations: (Organization & { role: string })[];
}

export function PlatformAdminClient({
  overview,
  userOrganizations,
}: PlatformAdminClientProps) {
  const [activeTab, setActiveTab] = React.useState<'tenants' | 'security' | 'readiness'>('tenants');

  const { isAuthorized, metrics, organizations } = overview;

  // Actual metrics or zero baseline
  const effectiveMetrics = metrics || {
    totalTenants: userOrganizations.length,
    activeTenants: userOrganizations.length,
    suspendedTenants: 0,
    totalProperties: 0,
    tierBreakdown: { starter: userOrganizations.length, growth: 0, pro: 0, enterprise: 0 },
  };

  const effectiveOrgs = organizations && organizations.length > 0
    ? organizations
    : userOrganizations;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                  Platform Administration Console
                </h1>
                <Badge variant="outline" className="bg-zinc-100 text-zinc-700 font-mono text-[10px]">
                  SUPER-ADMIN
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                StayPilot Platform Operations • Cross-Tenant Architecture • Security Governance &amp; Subscriptions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/settings/property">
            <Button variant="outline" size="sm">
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              Property Console
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Context Notification */}
      {!isAuthorized && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">
              Platform Administration Privilege Guardrail Active
            </p>
            <p className="text-amber-800 leading-relaxed">
              In production, full cross-tenant data access is strictly restricted to platform operators with{' '}
              <code className="font-mono bg-amber-100/80 px-1 py-0.5 rounded text-amber-900 font-semibold">
                profiles.is_platform_admin = true
              </code>
              . Ordinary hotel owners and staff cannot query other tenants&apos; data or view cross-hotel telemetry.
              The architectural telemetry and security posture displayed below illustrates the live multi-tenant governance model.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-zinc-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Business Tenants</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">
                {effectiveMetrics.totalTenants}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Registered Hotel Groups
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Active Subscriptions</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {effectiveMetrics.activeTenants}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {effectiveMetrics.suspendedTenants} suspended
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Managed Properties</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">
                {effectiveMetrics.totalProperties}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Across all tenant accounts
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Tenant Isolation</p>
              <h3 className="text-base font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Enforced
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                PostgreSQL RLS + Composite FKs
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <Lock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-200">
        <button
          type="button"
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'tenants'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Tenant Accounts &amp; Tiers ({effectiveOrgs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Security &amp; RLS Isolation Audit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('readiness')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'readiness'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          SaaS Scaling Readiness
        </button>
      </div>

      {/* Tab 1: Tenants List */}
      {activeTab === 'tenants' && (
        <Card className="border-zinc-200/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-zinc-900">
                  Business Tenant Accounts
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Hierarchical organizations managing one or more hotel properties.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {effectiveOrgs.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <p className="text-xs font-semibold text-zinc-700">No business tenant accounts registered yet</p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
                  When a hotel group registers on StayPilot, their multi-property organization and subscription status will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-200/80">
                    <tr>
                      <th className="py-3 px-4">Organization Name</th>
                      <th className="py-3 px-4">Identifier (Slug)</th>
                      <th className="py-3 px-4">Subscription Plan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Property Quota</th>
                      <th className="py-3 px-4 text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 font-normal text-zinc-700">
                    {effectiveOrgs.map((org) => (
                      <tr key={org.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-zinc-900">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 font-bold text-xs">
                              {org.name.charAt(0)}
                            </div>
                            <div>
                              <span>{org.name}</span>
                              {org.billing_email && (
                                <p className="text-[11px] text-zinc-400 font-normal">{org.billing_email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">
                          {org.slug}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant="outline"
                            className={
                              org.subscription_tier === 'enterprise'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : org.subscription_tier === 'pro'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                            }
                          >
                            {org.subscription_tier.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              org.subscription_status === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                org.subscription_status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            {org.subscription_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600">
                          Up to {org.max_properties} properties
                        </td>
                        <td className="py-3.5 px-4 text-right text-zinc-500 font-mono text-[11px]">
                          {org.created_at ? org.created_at.split('T')[0] : '2026-01-15'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Security & RLS Isolation Audit */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <Card className="border-zinc-200/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <CardTitle className="text-base font-bold text-zinc-900">
                Multi-Tenant Security Architecture &amp; RLS Checklist
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Detailed audit of security invariants enforced at the database kernel level.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Property-Level Data Partitioning (RLS)
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    All tables (<code className="font-mono text-zinc-800">properties</code>,{' '}
                    <code className="font-mono text-zinc-800">room_types</code>,{' '}
                    <code className="font-mono text-zinc-800">rooms</code>,{' '}
                    <code className="font-mono text-zinc-800">audit_logs</code>) have Row Level Security enabled.
                    Users without membership cannot view, insert, or update rows.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Recursion-Free Security Definer Helpers
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Policies utilize <code className="font-mono text-zinc-800">is_property_member()</code> and{' '}
                    <code className="font-mono text-zinc-800">get_user_property_role()</code> with{' '}
                    <code className="font-mono text-zinc-800">SET search_path = public</code>, preventing circular policy recursion.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Composite Foreign Key Bounds
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    <code className="font-mono text-zinc-800">FOREIGN KEY (property_id, room_type_id) REFERENCES room_types(property_id, id)</code>{' '}
                    guarantees that a physical room cannot reference a room category belonging to another property.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Privilege Escalation Prevention
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    <code className="font-mono text-zinc-800">can_insert_property_member()</code> verifies that general managers cannot grant the Owner role to anyone. Only existing property Owners can appoint new Owners.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Housekeeping Structural Tamper Trigger
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    PostgreSQL trigger <code className="font-mono text-zinc-800">check_room_update_permission()</code> rejects any attempt by housekeeping staff to modify room numbers, rates, categories, or floors.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Append-Only Audit Trail
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    <code className="font-mono text-zinc-800">public.audit_logs</code> maintains immutable operational records of room status updates, member invitations, and property creation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: SaaS Readiness */}
      {activeTab === 'readiness' && (
        <Card className="border-zinc-200/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle className="text-base font-bold text-zinc-900">
              SaaS Multi-Tenant Readiness Matrix
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Architecture roadmap for multi-hotel enterprise scale and OTA integrations.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 flex items-start gap-3">
                <Database className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-zinc-900">OTA Credentials per Property (Phase 4 Preparation)</span>
                  <p className="text-zinc-600 text-[11px] leading-relaxed">
                    Booking.com, MakeMyTrip, and Agoda channel credentials will be stored in a dedicated{' '}
                    <code className="font-mono text-zinc-800">ota_credentials</code> table with property-level isolation and AES-256 encryption. OTA sync tasks operate in a sandboxed background queue per property ID.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 flex items-start gap-3">
                <Users className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-zinc-900">Corporate Staff vs. Property Staff Hierarchy</span>
                  <p className="text-zinc-600 text-[11px] leading-relaxed">
                    With <code className="font-mono text-zinc-800">organizations</code> and{' '}
                    <code className="font-mono text-zinc-800">properties</code> separated, corporate hotel chain executives enjoy multi-property oversight, while front-desk agents remain strictly compartmentalized to their physical resort location.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 flex items-start gap-3">
                <Building2 className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-zinc-900">Custom Domains &amp; Branded Booking Engine (Phase 5 Preparation)</span>
                  <p className="text-zinc-600 text-[11px] leading-relaxed">
                    Each organization or property can be mapped to custom domains (e.g., <code className="font-mono text-zinc-800">book.vrindanivas.com</code>) routed through Next.js middleware using the organization&apos;s unique slug.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
