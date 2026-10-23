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

Requirements: Node.js 20.19+ or 22.13+, plus Expo-compatible Android/iOS tooling. The mobile app targets Expo SDK 55, React Native 0.83, and React 19.2.

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
- The Expo mobile dependency audit still reports 34 findings in the npm production dependency tree (27 high, 7 moderate, 0 critical) after the SDK 55 alignment. Mobile CI reports these findings and runs Expo Doctor, TypeScript, lint, and a web export, but the audit is **not clean**. A further, separately tested SDK/toolchain upgrade and device smoke tests are still required before production use.
