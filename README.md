# FoodieFly

FoodieFly is a local-delivery demo with two front ends:

- **Mobile app:** Expo Router + React Native, with Appwrite configuration in the environment.
- **Web app:** Next.js storefront in `website/`, with Supabase Auth and database-backed customer orders and delivery-driver dashboards.

The demo storefront includes fictional restaurants, grocery stores, and lifestyle products. It is a portfolio project, not a live marketplace or payment processor.

## Web app

See [website/README.md](website/README.md) for setup, Supabase SQL, deployment, and security notes.

Quick start:

```bash
cd website
npm ci
cp .env.example .env.local
npm run dev
```

Fill in your Supabase project URL and publishable key in `.env.local` before testing authentication and orders.

## Mobile app

Requirements: Node.js and Expo-compatible Android/iOS tooling.

```bash
npm ci
cp .env.example .env.local
npx expo start
```

Set your own Appwrite project ID and endpoint in `.env.local`. Public project identifiers are configuration, not secrets; never place server API keys or admin credentials in `EXPO_PUBLIC_*` variables.

## Security notes

- Public sign-up creates customer accounts only. Delivery-driver roles must be assigned by a trusted administrator.
- The web app's Supabase policies and triggers are documented in `website/supabase/`.
- Demo product prices are client-side sample data. Do not process real payments until a trusted server-side catalog and checkout flow are implemented.
- Use test credentials and a non-production Supabase project while validating order flows.
- The Expo mobile dependency audit still reports 51 transitive findings (2 critical, 39 high, 9 moderate, 1 low), including nested Expo/React Native tooling dependencies. A safe lockfile refresh updates some packages, but complete remediation appears to require a separately tested Expo SDK upgrade. Mobile CI reports these findings without claiming the audit is clean; do not treat this as a resolved security issue.
