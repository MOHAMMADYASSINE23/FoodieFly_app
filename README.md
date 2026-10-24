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

Before release, follow the [mobile device smoke-test checklist](docs/MOBILE_DEVICE_SMOKE_TEST.md) for real-device Appwrite validation.

## Security notes

- Public sign-up creates customer accounts only. Delivery-driver roles must be assigned by a trusted administrator.
- The web app's Supabase policies and triggers are documented in `website/supabase/`.
- Demo product prices are client-side sample data. Do not process real payments until a trusted server-side catalog and checkout flow are implemented.
- Use test credentials and a non-production Supabase project while validating order flows.
- The latest Expo mobile `npm audit --omit=dev` report contains 9 findings (4 high, 5 moderate, 0 critical), including findings in the Expo CLI toolchain pulled in by the Expo package. The dependency tree is **not clean**, and the audit does not prove every affected package ships in the production app bundle. Compatible overrides upgraded Zod to 4.6.7, `query-string` to 9.5.1, and `postcss-selector-parser` to 6.1.5; the audit dropped from 13 findings to 9. The remaining high findings include `node-forge@1.4.0` in Expo's code-signing/CLI chain, for which no patched release is currently listed. Remaining moderate findings involve Expo Router / NativeWind dependency chains where the audit's suggested fixes require major-version changes. Recheck the audit and complete real-device smoke tests before production use.
