# FoodieFly mobile device smoke test

Run this checklist on a real Android device and, if available, a real iPhone after installing the Expo SDK 55 dependency set. CI validates typecheck, lint, Expo Doctor, and a web export, but it cannot prove Appwrite requests work against your project.

## Before testing

- [ ] Use a dedicated **development** Appwrite project, not a production project.
- [ ] Copy `.env.example` to `.env.local` and fill in the endpoint, project ID, and bucket ID for that project.
- [ ] Confirm the Appwrite database ID and collection IDs in `lib/write.ts` match the project. The app currently expects the configured user, category, menu, customization, and menu-customization collections.
- [ ] Check collection/document permissions in the Appwrite Console. Never add an Appwrite server API key to an `EXPO_PUBLIC_*` variable.
- [ ] Start the app with `npm ci` and `npx expo start`.

## Authentication and session

- [ ] Create a new test account with a unique email.
- [ ] Confirm the Appwrite account is created and a matching user document is saved in the `user` collection with the account ID.
- [ ] Try creating the same email again and confirm the app shows a useful error without crashing.
- [ ] Sign in with the correct password.
- [ ] Try a wrong password and confirm no authenticated screen is shown.
- [ ] Fully close and reopen the app; confirm the session behavior is intentional and does not expose another user's data.
- [ ] Sign out, then confirm protected user data is no longer visible.

## Appwrite data and network behavior

- [ ] Open every screen wired to categories/menu data. Confirm data loads from the expected collections.
- [ ] If search or category filters are wired in this build, try an exact match, no-results query, and switching categories.
- [ ] If the current app exposes a Storage upload/read flow, upload a harmless test image, verify it can be read, then delete the test object.
- [ ] Disable the network, trigger a data request, and confirm the UI shows a recoverable error or empty state rather than crashing.
- [ ] Re-enable the network and retry; confirm the app recovers.
- [ ] Verify no real user data or secret tokens appear in logs or error messages.

## Record the result

For each failed step, capture the device/OS, screen, exact steps, expected behavior, actual behavior, and sanitized error text. Do not include passwords, session cookies, API keys, or real customer information.

**Release gate:** do not call the mobile app production-ready solely because CI passes. The current dependency audit still reports 9 findings (4 high, 5 moderate, 0 critical), including the unpatched `node-forge@1.4.0` issue in Expo's CLI/code-signing toolchain. Review the current [README security notes](../README.md) before any production deployment.
