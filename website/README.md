# FoodieFly Web

A responsive local-storefront demo built with Next.js, React, TypeScript, and Supabase. It includes a customer checkout flow and a separate delivery-driver dashboard.

## Features

- Browse demo restaurant, grocery, and lifestyle products.
- Add products to a cart, enter delivery details, and optionally attach browser geolocation.
- Create customer accounts and sign in with Supabase Auth.
- Persist orders and order items in Supabase.
- View customer order history and update delivery status from a driver dashboard.
- Enforce account roles, order ownership, and delivery status transitions in database policies/triggers.

## Local development

From this directory:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set these variables in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Do not add a Supabase service-role key to browser code or any `NEXT_PUBLIC_*` variable.

## Supabase setup

For a new test project, run these scripts in order in the Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/orders.sql`

For an existing database created with the earlier demo SQL, review the existing delivery accounts, then run `supabase/security-hardening.sql`. It prevents users from assigning themselves the delivery role, limits profile/order update permissions, recalculates order totals from line items, and enforces the delivery status sequence.

After setup, create a normal customer account. To approve a delivery driver, verify the person's identity first, then promote the account from a trusted administrator context using its real profile UUID:

```sql
UPDATE public.profiles
SET role = 'delivery'
WHERE id = 'replace-with-verified-profile-uuid';
```

Never expose administrator credentials to the browser. Before applying the hardening migration to an existing project, review current rows with `role = 'delivery'` so unexpected privileged accounts can be investigated.

## Quality checks

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

## Security audit status

The CI production-dependency audit is expected to block any vulnerable runtime dependency. The full dependency audit may still report five high-severity findings in the development/lint chain (`braces` through `micromatch`, `fast-glob`, and the Next.js ESLint configuration). npm's forced remediation downgrades `eslint-config-next` to a different major version, so do not apply it blindly; track this separately for a compatible tooling migration.

## Demo limitations

- Store names, products, and prices are fictional client-side data.
- The database recalculates order totals from stored line items, but the line-item unit prices still originate from the browser. Do not take real payments until a trusted database-backed product catalog and server-validated checkout are implemented.
- No payment gateway is connected.
- Delivery updates are polling-based, not real-time subscriptions.
- Use a non-production Supabase project for testing.
