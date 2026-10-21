import * as React from 'react';
import { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { getUserProperties } from '@/lib/actions/property';
import { createClient } from '@/lib/supabase/server';
import { PropertyMember, PropertyInvitation } from '@/types';

export const metadata: Metadata = {
  title: 'Staff & Permissions — StayPilot',
  description: 'Manage hotel team members, roles, and granular access controls.',
};

export default async function HotelStaffPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  let members: PropertyMember[] = [];
  let invitations: PropertyInvitation[] = [];

  if (currentProperty) {
    const supabase = await createClient();
    const [membersRes, invitesRes] = await Promise.all([
      supabase
        .from('property_members')
        .select('*, profile:profiles(*)')
        .eq('property_id', currentProperty.id),
      supabase
        .from('property_invitations')
        .select('*')
        .eq('property_id', currentProperty.id),
    ]);

    members = membersRes.data || [];
    invitations = invitesRes.data || [];
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Staff &amp; Permissions
            </h1>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Role-Based Access
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Control property access with role boundaries (Owner, Manager, Receptionist, Housekeeping).
          </p>
        </div>
      </div>

      {/* Staff Members List */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Authorized Team Members</h2>
            <p className="text-xs text-zinc-500">Personnel with authenticated access to this hotel property.</p>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No active staff members listed.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white uppercase text-xs">
                    {member.profile?.full_name ? member.profile.full_name[0] : 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900">{member.profile?.full_name || 'Staff User'}</p>
                    <p className="text-[11px] text-zinc-400 font-mono">{member.user_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold text-zinc-700 uppercase">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-900">Pending Invitations</h2>
          <p className="text-xs text-zinc-500">Invitations issued to staff awaiting acceptance.</p>
        </div>

        {invitations.length === 0 ? (
          <div className="p-8 text-center space-y-1">
            <Mail className="mx-auto h-6 w-6 text-zinc-300" />
            <p className="text-xs text-zinc-500">No pending staff invitations</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {invitations.map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-zinc-900">{inv.email}</p>
                  <p className="text-[11px] text-zinc-400">Role: {inv.role}</p>
                </div>
                <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold">
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
