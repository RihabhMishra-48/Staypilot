# StayPilot — Hotel Operations & OTA Channel Manager SaaS

> **Phase 1 & Phase 2 Complete**  
> Enterprise Property Management System (PMS), bi-directional OTA Channel Manager, and Direct Booking Engine.

StayPilot is a multi-tenant SaaS platform built for independent boutique hotels, heritage resorts, and hospitality management chains. It delivers a fast, Linear- and Stripe-inspired operational console engineered exclusively on **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase PostgreSQL**.

---

## 1. System Architecture & Delivered Scope

### Phase 1: Foundation (Complete)
1. **Multi-Tenant Foundation & Membership Control**:
   - Strict property isolation.
   - User profile synchronization linked to `auth.users`.
   - Property membership with four granular operational roles:
     - `owner`: Full property administration, billing, team management, property deletion.
     - `manager`: Property configuration, rate plans, room assignments, operational reports.
     - `receptionist`: Front desk check-ins, reservations, folios, guest profiles.
     - `housekeeping`: Room cleanliness updates, task checklists, maintenance tickets.
2. **PostgreSQL Schema & Recursion-Free Row Level Security (RLS)**:
   - Tables: `public.profiles`, `public.properties`, `public.property_members`.
   - Security Definer helper functions (`is_property_member`, `get_user_property_role`, `can_insert_property_member`) eliminating recursive policy overhead while enforcing strict tenant barriers.
   - Auto-updating `updated_at` triggers and automated user profile provisioning triggers.
3. **Application Layout & Navigation (14 Modules)**:
   - Collapsible desktop sidebar with active route tracking and status badges.
   - Mobile navigation drawer with backdrop blur and responsive ergonomics.
   - Top navigation bar featuring breadcrumbs, real-time property switcher, date indicator, live alerts, and user menu.
4. **Overview Dashboard**:
   - Core physical room KPIs linked to live database counts (with graceful demo preview when no rooms exist).
   - Clear demarcation between live property inventory and future Phase 3 reservation metrics.
5. **Property Setup & Management**:
   - Multi-property management with full configuration (address, currency, timezone, check-in/out policies).

---

### Phase 2: Real Room Management & Inventory (Complete)
1. **Database Schema (`supabase/migrations/20261021000001_phase2_rooms_and_inventory.sql`)**:
   - **`public.room_types`**:
     - `id` (UUID PK), `property_id` (FK to `properties`), `name`, `description`, `max_adults`, `max_children`, `bed_configuration`, `base_rate` (numeric >= 0), `amenities` (text[]), `is_active` (boolean), `created_at`, `updated_at`.
     - Unique constraint: `(property_id, name)`.
     - Non-negative constraints: `base_rate >= 0`, `max_adults >= 1`, `max_children >= 0`.
   - **`public.rooms`**:
     - `id` (UUID PK), `property_id` (FK to `properties`), `room_type_id` (FK to `room_types`), `room_number`, `floor`, `operational_status` (`available`, `cleaning`, `dirty`, `maintenance`, `out_of_service`), `notes`, `is_archived` (boolean), `created_at`, `updated_at`.
     - Unique constraint: `(property_id, room_number)` preventing duplicate room numbers inside the same property.
     - Composite Foreign Key: `FOREIGN KEY (property_id, room_type_id) REFERENCES room_types(property_id, id) ON DELETE RESTRICT` guaranteeing a room can never point to a room type belonging to another property, and preventing accidental deletion of room types that have rooms assigned.
     - Operational status check constraint enforcing valid PMS statuses.
2. **Role-Based Row Level Security (RLS) & Triggers**:
   - RLS enabled on `room_types` and `rooms`.
   - Only authorized members of the property can view rooms and room types.
   - Owners and managers can create, edit, and archive room types and rooms.
   - Receptionists can read rooms and update operational statuses.
   - Housekeeping can update room operational statuses (`available`, `cleaning`, `dirty`, `maintenance`, `out_of_service`), but a PostgreSQL trigger `check_room_update_permission()` prevents housekeeping from altering room numbers, room categories, or floors.
3. **Rooms & Inventory Management UI (`/dashboard/rooms`)**:
   - **Inventory Summary Cards**: Total physical rooms, Ready/Available units, Housekeeping queue (`dirty` + `cleaning`), Maintenance & Out-of-service, Active Room Types.
   - **Search & Filterable Room Units Table**: Filter by operational status, room type, or search by room number.
   - **Quick Operational Status Transition Dialog**: Seamlessly update room status with optional internal housekeeping notes.
   - **Add & Edit Room Unit Dialog**: Strict validation, room type selection, floor number, operational status, and duplicate room number protection.
   - **Soft Archival with Confirmation Dialog**: Preserves audit history instead of destructive deletion.
   - **Room Types / Categories Tab**: Visual category cards detailing occupancy limits, nightly base rate, amenities, and activation toggling.
   - **Add & Edit Room Category Dialog**: Form with amenity tags, occupancy limits, and nightly pricing.
4. **Room Inventory Calendar (`/dashboard/calendar`)**:
   - Interactive multi-day tape chart (7-day and 14-day views) showing physical room rows and date columns.
   - Date navigation (Previous, Next, Today shortcut).
   - Filter by operational status and room category.
   - Operational status chips for each room (`Ready`, `Cleaning`, `Dirty`, `Maint`, `OOS`).
   - Honest empty state for reservation blocks explaining reservation booking engine activates in Phase 3 (no fabricated reservations or fake occupancy blocks).
5. **Inventory Architecture for Future Booking (Phase 3 Prep)**:
   - Clear separation between **physical operational status** and **booking availability**.
   - Rooms under `maintenance` or `out_of_service` are automatically excluded from sellable inventory.
   - Designed to support per-date reservation calculations without permanently storing rigid availability numbers.
6. **Automated Unit Tests**:
   - Comprehensive test suite in `tests/room-inventory.test.ts` validating room types, capacities, status transitions, and sellable inventory calculations.

---

### Multi-Tenant SaaS Architecture & Security Hardening (Delivered)
1. **3-Tier Multi-Tenant Entity Hierarchy (`supabase/migrations/20261021000002_multi_tenant_saas_architecture.sql`)**:
   - **`public.organizations`**: The root business account / tenant entity owning subscriptions (`starter`, `growth`, `pro`, `enterprise`), billing status (`trialing`, `active`, `past_due`, `canceled`, `suspended`), and property quotas (`max_properties`).
   - **`public.organization_members`**: Corporate and chain-wide memberships (`owner`, `admin`, `member`) allowing corporate management across multiple properties.
   - **`public.properties`**: Physical hotel locations linked to their parent organization via `organization_id REFERENCES organizations(id) ON DELETE CASCADE`.
   - **`public.property_members`**: Property-level operational staff roles (`owner`, `manager`, `receptionist`, `housekeeping`).
2. **Privilege Escalation Prevention**:
   - Hardened `can_insert_property_member(property_id, user_id, role)`: General Managers can **only** invite front desk (`receptionist`) and `housekeeping` staff. Only existing property Owners can appoint or grant the `owner` role, eliminating unauthorized privilege escalation.
3. **Composite Boundary Protection on Rooms**:
   - Added `CONSTRAINT uq_rooms_property_composite UNIQUE (property_id, id)` to `rooms`. Guarantees that future Phase 3 reservations and room assignments can enforce composite foreign keys `(property_id, room_id)`, preventing any reservation from referencing a room belonging to another property.
4. **Platform Administration Console (`/dashboard/platform-admin`)**:
   - Dedicated console for StayPilot operators protected by `profiles.is_platform_admin = true`.
   - Provides multi-tenant telemetry (total tenants, active subscriptions, managed hotels across the SaaS, subscription tier distribution).
   - Real-time audit checklist of all database kernel security guardrails.
   - Does NOT expose service-role credentials to the client bundle.
5. **Immutable Operational Audit Trail (`public.audit_logs`)**:
   - Scoped to `(organization_id, property_id)`.
   - Tracks operational room status changes, staff invitations, property creations, and room archival.
   - Append-only policy: users cannot modify or delete audit log entries.
6. **Property Staff Invitations (`public.property_invitations`)**:
   - Generates cryptographically secure, time-limited invitation tokens (7-day expiry) for onboarding team members without premature access.
7. **Automated Multi-Tenant Security Tests (`tests/multi-tenant-security.test.ts`)**:
   - 22 unit tests passing (100% test pass rate) validating cross-tenant boundaries, privilege escalation rejection, property quotas, and audit log schemas.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router with Turbopack) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS v4 (Light theme, refined slate/zinc palette, subtle borders) |
| **Icons** | Lucide React |
| **Primary Database** | Supabase PostgreSQL (Single primary database) |
| **Authentication** | Supabase Auth (Cookie-based session via `@supabase/ssr`) |
| **Validation** | Zod (Schema parsing on both client & server) |
| **Testing** | Node.js Test Runner with `tsx` |

---

## 3. Getting Started & Installation

### Prerequisites
- Node.js 18.18+ or 20+
- npm 9+
- A [Supabase](https://supabase.com) project (free tier or self-hosted)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Note:** Service-role or secret keys must NEVER be placed in client-facing variables.

---

## 4. Database Setup & SQL Migrations

StayPilot uses versioned SQL migrations located in `supabase/migrations/`:

| Migration File | Description |
|---|---|
| `20261021000000_initial_schema.sql` | Phase 1: Profiles, properties, property members, RLS helper functions. |
| `20261021000001_phase2_rooms_and_inventory.sql` | Phase 2: Room types, physical rooms, composite constraints, housekeeping triggers, and RLS policies. |
| `20261021000002_multi_tenant_saas_architecture.sql` | Multi-Tenant Architecture: Organizations, Organization Members, Privilege-Escalation Hardening, Platform Admin, Audit Logs, and Invitations. |

### Option A: Using the Supabase Web Dashboard (Recommended)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Navigate to **SQL Editor** in the left sidebar.
3. Run `20261021000000_initial_schema.sql` first.
4. Run `20261021000001_phase2_rooms_and_inventory.sql` second.
5. Run `20261021000002_multi_tenant_saas_architecture.sql` third.
6. The multi-tenant hierarchy, foreign keys, triggers, and RLS policies are now active in your database.

### Option B: Using Supabase CLI
```bash
npx supabase login
npx supabase link --project-ref your-project-id
npx supabase db push
```

---

## 5. Development, Testing & Production Commands

- **Run Automated Tests**:
  ```bash
  npm test
  ```
  Runs the full Phase 2 unit test suite testing room inventory validation, operational status logic, and rate rules.

- **Start Development Server**:
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Run TypeScript & ESLint Quality Checks**:
  ```bash
  npm run lint
  ```

- **Compile Production Build**:
  ```bash
  npm run build
  ```

- **Run Production Server**:
  ```bash
  npm run start
  ```

---

## 6. Project Architecture

```
├── app/
│   ├── auth/callback/route.ts      # OAuth and email verification callback
│   ├── dashboard/
│   │   ├── booking-engine/page.tsx # Phase 5 Direct Booking Engine roadmap
│   │   ├── calendar/page.tsx       # Phase 2 Room Tape Chart (Live Inventory)
│   │   ├── channel-manager/page.tsx# Phase 4 OTA Integrations roadmap
│   │   ├── front-desk/page.tsx     # Phase 3 Reception operations roadmap
│   │   ├── guests/page.tsx         # Phase 3 Guest directory & CRM roadmap
│   │   ├── housekeeping/page.tsx   # Phase 3 Housekeeping matrix roadmap
│   │   ├── payments/page.tsx       # Phase 3 GST Invoices & billing roadmap
│   │   ├── rates/page.tsx          # Phase 2 Rate plans roadmap
│   │   ├── reports/page.tsx        # Phase 6 Hospitality analytics roadmap
│   │   ├── reservations/page.tsx   # Phase 3 Reservations & folios roadmap
│   │   ├── rooms/page.tsx          # Phase 2 Room types & units (Live CRUD)
│   │   ├── settings/property/      # Live Property Setup & Edit interface
│   │   ├── staff/page.tsx          # Phase 3 Staff roles & access roadmap
│   │   ├── layout.tsx              # Dashboard Server Layout with tenant loader
│   │   └── page.tsx                # Overview Dashboard with live & preview metrics
│   ├── globals.css                 # Global CSS and light-theme design tokens
│   ├── layout.tsx                  # Root layout with typography and metadata
│   ├── login/page.tsx              # Hotelier sign-in with auth validation
│   ├── page.tsx                    # Commercial product entrance
│   └── signup/page.tsx             # Hotelier registration with tenant creation
├── components/
│   ├── calendar/                   # Tape chart component (room-calendar-view.tsx)
│   ├── dashboard/                  # Metric cards, quick actions, feeds, banners
│   ├── layout/                     # Persistent sidebar, top-nav, placeholders
│   ├── property/                   # Property form (Zod) and property list
│   ├── rooms/                      # Room table, types list, modals, status change
│   └── ui/                         # Reusable primitives (Button, Input, Card, etc.)
├── lib/
│   ├── actions/                    # Server Actions (Auth, Property, Room)
│   ├── demo-data.ts                # Structured demo datasets for Phase 1 preview
│   ├── supabase/                   # Client, server, middleware, and config helpers
│   ├── utils.ts                    # Utility functions (cn, formatCurrency, formatDate)
│   └── validation/                 # Zod validation schemas (Property, Auth, Room)
├── supabase/
│   └── migrations/                 # PostgreSQL migrations and RLS policies
│       ├── 20261021000000_initial_schema.sql
│       └── 20261021000001_phase2_rooms_and_inventory.sql
├── tests/
│   └── room-inventory.test.ts      # Automated unit tests for Phase 2
└── types/
    └── index.ts                    # TypeScript types and data models
```

---

## 7. Roadmap & Milestone Progress

| Phase | Milestone | Status | Key Capabilities |
|---|---|---|---|
| **Phase 1** | **Foundation** | **Delivered** | Multi-tenant PostgreSQL, RLS policies, Auth, 14-module layout, Property Setup, Overview Dashboard. |
| **Phase 2** | **Rooms & Inventory** | **Delivered** | Room types, physical room units, amenities, composite foreign keys, housekeeping RLS triggers, live inventory tape chart, operational status workflow. |
| **Phase 3** | **PMS Operations** | Up Next | Concurrency-safe reservations, front desk lobby check-in, guest folios, housekeeping cleanliness dispatch, GST invoices. |
| **Phase 4** | **OTA Channel Manager** | Planned | Certified 2-way ARI sync with MakeMyTrip, Goibibo, Agoda, and Booking.com with automated rate parity. |
| **Phase 5** | **Direct Booking Engine** | Planned | Commission-free guest booking engine, mobile checkout, Razorpay, Stripe, and UPI payment integration. |
| **Phase 6** | **Reports & Hardening** | Planned | Historical RevPAR/ADR analytics, pacing reports, night audit logs, security hardening, automated backups. |

---

## 8. License & Authorship

StayPilot is developed as an enterprise hotel management system. Built with commercial quality standards.
