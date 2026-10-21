import { FuturePhasePlaceholder } from '@/components/layout/future-phase-placeholder';
import { ShieldCheck } from 'lucide-react';

export default function StaffPage() {
  return (
    <FuturePhasePlaceholder
      phase="Phase 3"
      title="Staff Management & Role-Based Permissions"
      description="Invite team members, assign operational roles, and enforce granular access controls."
      icon={ShieldCheck}
      plannedFeatures={[
        'Team invitations via email with secure time-limited registration links.',
        'Granular role assignment: Owner, General Manager, Receptionist, Housekeeping, and Auditor.',
        'Shift management: Track front desk drawer opening and closing shifts by user.',
        'Security access log: Full audit trail of rate overrides, discount authorizations, and room status updates.',
        'Two-factor authentication (2FA) enforcement for high-privilege administrative accounts.',
      ]}
      architecturalFoundation={[
        'public.property_members table with role check constraint live in Phase 1.',
        'get_user_property_role() and can_insert_property_member() helper functions active.',
        'Profile sync automatically provisions new hotel staff upon email confirmation.',
      ]}
    />
  );
}
