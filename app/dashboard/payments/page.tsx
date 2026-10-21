import { FuturePhasePlaceholder } from '@/components/layout/future-phase-placeholder';
import { Receipt } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <FuturePhasePlaceholder
      phase="Phase 3"
      title="Payments, Folios & GST Invoices"
      description="Billing folios, GST compliant tax invoices, advance deposit receipts, and payment ledger."
      icon={Receipt}
      plannedFeatures={[
        'Full Indian GST tax breakdown (CGST, SGST, IGST) with SAC code compliance.',
        'Multi-currency folio settlements with support for credit cards, cash, UPI, and bank transfers.',
        'Split folios for corporate guests with company billing separate from room incidentals.',
        'Printable and downloadable PDF tax invoice generation.',
        'Daily cashier balance reports and point-of-sale (POS) terminal reconciliation.',
      ]}
      architecturalFoundation={[
        'Currency standards derived from Phase 1 property configuration.',
        'Immutable financial ledger schema with append-only payment entries.',
        'Manager and Owner role restrictions on issuing invoice cancellations or discounts.',
      ]}
    />
  );
}
