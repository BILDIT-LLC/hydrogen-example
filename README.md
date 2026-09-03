# @bildit-platform/hydrogen Example

Shopify Hydrogen storefront demonstrating **BILDIT VXE** integration with [`@bildit-platform/hydrogen`](https://www.npmjs.com/package/@bildit-platform/hydrogen).

This is the Hydrogen counterpart to [`nextjs-example`](../nextjs-example). It shows:

- **`getBannersForRequest`** — server-side banner fetch by path + preview date
- **`SlotPlaceholder`** — slot rendering with `fallback` and `forceFallback`
- **`StylePlaceholder`** — VXE-managed CSS injection into `head`
- **VXE Live Editor** — admin bridge + CSP helpers for iframe embedding

Uses Shopify’s mock.shop data source by default (no store connection required).

## Requirements

- Node.js 22+ recommended (Hydrogen 2026.x); 20+ may work with engine warnings
- npm, yarn, or pnpm

## Install

```bash
cd hydrogen-example
npm install
```

## Before you verify

The VXE **Verify** button looks for `BilditRoot` on the live storefront — not a script tag in `<head>`. Install the adapter and wrap the app **before** you click Verify:

```bash
yarn add @bildit-platform/hydrogen
```

```tsx
import { BilditRoot } from '@bildit-platform/hydrogen/client'

<BilditRoot banners={banners}>
  {children}
</BilditRoot>
```

This example already wraps the storefront in `BilditRoot` in `app/root.jsx`. Set your env vars, run the app, then click **Verify** in the VXE.

## Environment variables (Hydrogen vs Next.js)

**Same variable names** as Next.js: `BILDIT_API_KEY` and `BILDIT_API_URL`. The difference is **how you set and read them**.

| | Next.js | Hydrogen |
|---|---|---|
| Local file | `.env.local` | `.env` (MiniOxygen) |
| Local read | `process.env.BILDIT_*` | `context.env.BILDIT_*` |
| Production | Host env (e.g. Vercel) | **Oxygen** environment variables |
| Fetch helper | `RemoteConnector` + `process.env` | `getBannersForRequest(request, context.env)` |

### Local development

Edit `.env` (not `.env.local`):

```bash
BILDIT_API_KEY=your-api-key
BILDIT_API_URL=https://your-site.web.app   # VXE instance root (no path)
```

MiniOxygen loads `.env` into the worker `Env` bindings. In loaders, read them through **`context.env`**:

```jsx
// app/root.jsx
const banners = await getBannersForRequest(args.request, args.context.env);
// getBannersForRequest reads env.BILDIT_API_URL + env.BILDIT_API_KEY
```

Do **not** rely on `process.env` in Oxygen workers — use `context.env`.

### Production (Oxygen)

Set the **same two names** as Oxygen environment variables (Hydrogen storefront settings, or `shopify hydrogen env push` / dashboard). Local `.env` is **not** deployed.

| Variable | Required | Description |
|---|---|---|
| `BILDIT_API_KEY` | ✅ | API key from Configuration → API Keys |
| `BILDIT_API_URL` | ✅ | Root URL of your VXE instance (SDK appends `/remote-webbanners_v1_4`) |

Types for these bindings are declared in `env.d.ts`.

## Run

```bash
npm run dev
```

## Dependency registration (Hydrogen vs Next.js)

**Yes — same job, different shape.**

| | Next.js | Hydrogen |
|---|---|---|
| Config file | You build `cmsDependencies.ts` | `app/lib/cmsDependencies.js` + package `hydrogenDependenciesConfig` |
| Wired into provider | `extraDependenciesConfig={cmsDependencies}` on `BilditProvider` | `hydrogenDependenciesConfig` on Hydrogen’s `BilditProvider`, plus `extraDependenciesConfig` on `BilditRoot` |
| Live Editor | Same modules must be available to the admin script | `registerHostCmsDependencies()` in `entry.client.jsx` copies **non-React** host modules onto `window.cmsDependencies` |

### What’s registered by default

Storefront interpretation (`hydrogenDependenciesConfig` on `BilditProvider`) includes Hydrogen-native modules:

- `react`, `react/jsx-runtime`, `react/jsx-dev-runtime` (Hydrogen’s React 18 — storefront only)
- `react-dom`, `react-dom/client`
- `react-router`
- `@shopify/hydrogen`

**Do not put host React on `window.cmsDependencies`.** Live Editor `admin.js` is React 19. If Hydrogen’s React 18 overrides it, compiled banners throw [minified React error #525](https://react.dev/errors/525) (“A React Element from an older version of React was rendered”). This is not a missing Tailwind package.

### Tailwind (CSS, not a cmsDependency)

BILDIT banners use Tailwind utility classes. That is **CSS**, not a JS module — do **not** register `tailwindcss` on `window.cmsDependencies`.

- **Host UI:** `app/styles/tailwind.css` + `@tailwindcss/vite` scan storefront source only.
- **Saved banners:** the VXE scans classes and compiles Tailwind CSS into the banner (`WithTwBase` / `<style data-inject-for="tw">`).
- **Drafts / Live Editor:** this example also loads the same browser runtime the VXE preview uses, because Vite cannot see class names that exist only in VXE code:

```jsx
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" nonce={nonce}></script>
```

`cdn.jsdelivr.net` must be allowed in Hydrogen CSP `scriptSrc` (already in `entry.server.jsx`).

### Reference in this repo

```jsx
// app/entry.client.jsx — call BEFORE hydrateRoot
import {ensureHostReactGlobals} from '@bildit-platform/hydrogen/client';
import {registerHostCmsDependencies} from '~/lib/cmsDependencies';

ensureHostReactGlobals();
registerHostCmsDependencies();
```

Add extra JS modules (date-fns, icon libs, shared UI) in `app/lib/cmsDependencies.js` — the same list is passed to `BilditRoot` as `extraDependenciesConfig`. Banner code must import Hydrogen-native modules (`react-router`, `@shopify/hydrogen`), not `next/*`.

## Visual Editor bridge (Hydrogen vs Next.js)

**Related approach, different script.**

| | Next.js | Hydrogen |
|---|---|---|
| Script artifact | VXE download: `bildit-cms-script.min.js` | **Bundled-React** admin: `admin.js` (`USE_EXTERNAL_REACT=false`) |
| Default hosting | `public/scripts/bildit-cms-script.min.js` | CDN: `https://bildit-cdn.bilditon.com/cms-client-hydrogen/scripts/admin.js` |
| Bridge | Inline `postMessage` bridge in layout | Exported `BilditAdminBridge` (included by `BilditRoot`) |
| Optional local file | Required for the Next guide | Optional — override `adminScript` on `BilditRoot` |

Walkthrough (general VXE script concepts):

**[Arcade guide — install the script](https://app.arcade.software/flows/LyUaZaZMwkfwjseVtwaj/view)**

### Recommended (this example)

Use the Hydrogen CDN build via `BilditRoot` — no file under `public/` required:

```jsx
const BILDIT_ADMIN_SCRIPT =
  'https://bildit-cdn.bilditon.com/cms-client-hydrogen/scripts/admin.js';

<BilditRoot banners={banners} adminScript={BILDIT_ADMIN_SCRIPT}>
  …
</BilditRoot>
```

`BilditAdminBridge` posts `IFRAME_READY`, waits for the parent’s `INJECT_SCRIPT`, then injects that URL and posts `SCRIPT_INJECTED`.

### Optional: host under `public/scripts/`

Same idea as Next’s `public/scripts/`, but use the **Hydrogen bundled** build — **not** Next’s `bildit-cms-script.min.js` / `cms-client-no-react` (those cause React identity mismatches on Hydrogen):

```bash
# From bildit-web-script
USE_EXTERNAL_REACT=false pnpm build
# Copy → public/scripts/admin.js
```

```jsx
<BilditRoot banners={banners} adminScript="/scripts/admin.js">
```

See `public/scripts/README.md`.

### Oxygen / CSP caveats

1. **CSP is required for Live Editor.** This example spreads `bilditCspDirectives` into Hydrogen’s `createContentSecurityPolicy` and runs `allowBilditIframeEmbedding(header)` so VXE can iframe the storefront (`frame-ancestors` for admin.bildit.co, localhost, `*.web.app`, etc.). Without this, the editor iframe / script load fails silently.
2. **`scriptSrc` / `connectSrc`** must allow `https://bildit-cdn.bilditon.com` (and your Functions host if not already covered). Sentry ingest hosts are included for admin error reporting.
3. **Do not replace Shopify’s CSP wholesale** — merge Bildit directives so `cdn.shopify.com` / checkout stay intact.
4. **Caching:** banner responses are fetched per request in the root loader; Oxygen/CDN page caching can still serve stale HTML. Prefer short cache or revalidate after schedule changes. The admin script URL in this example appends a cache-busting query when injected by the bridge.
5. **Dev URL / port** in the VXE website settings must match your Hydrogen preview URL (`npm run dev`).

## Integration examples

### 1. Banner fetch (`getBannersForRequest`)

In `app/root.jsx`:

```jsx
import {getBannersForRequest} from '@bildit-platform/hydrogen/server';

export async function loader(args) {
  const banners = await getBannersForRequest(args.request, args.context.env);
  return { banners, /* ... */ };
}
```

Uses `BILDIT_API_URL` + `BILDIT_API_KEY` from Oxygen/env. Location = request pathname; preview date comes from the VXE URL param.

### 2. SlotPlaceholder with fallback

```jsx
import {SlotPlaceholder} from '@bildit-platform/hydrogen/client';

<SlotPlaceholder
  slotId="home-hero"
  fallback={<div>No content scheduled — default UI shows instead.</div>}
/>

<SlotPlaceholder
  slotId="promo-logo"
  forceFallback
  fallback={<div>Default logo</div>}
/>
```

### 3. StylePlaceholder

```jsx
import {StylePlaceholder} from '@bildit-platform/hydrogen/client';

<StylePlaceholder slotId="global-styles" target="head" />
<StylePlaceholder slotId="home-styles" target="head" />
```

### 4. Provider + client bootstrap

- `app/entry.client.jsx` — `ensureHostReactGlobals()` + `registerHostCmsDependencies()` before hydrate
- `app/lib/cmsDependencies.js` — extra JS modules; strips host React from `window.cmsDependencies`
- `app/root.jsx` — wrap the app in `<BilditRoot banners={…} extraDependenciesConfig={…}>` and load `@tailwindcss/browser`
- `app/entry.server.jsx` — `bilditCspDirectives` + `allowBilditIframeEmbedding()`
- `vite.config.js` — SSR `noExternal` for `@bildit-platform/*` packages

### 5. Preview date

```bash
http://localhost:3000/?bildit_preview_date=2026-02-15T00:00:00.000Z
```

## Project layout

```
app/
  entry.client.jsx          # React globals + VXE deps
  entry.server.jsx          # CSP + iframe embedding
  lib/cmsDependencies.js    # extra JS modules; omit host React (#525)
  root.jsx                  # getBannersForRequest + BilditRoot + Tailwind browser
  routes/
    _index.jsx              # Arcade blurb + home slots
    faq.jsx                 # FAQ slot examples
  components/bildit/
    BilditHomeSlots.jsx     # StylePlaceholder + SlotPlaceholder fallbacks
    BilditFooterSlot.jsx
    BilditFaqSlots.jsx
vite.config.js              # SSR noExternal for Bildit packages
```

## Banner code imports (Hydrogen)

Hydrogen banners must import **native modules only** — no `next/*`:

| Import | Module |
|--------|--------|
| `react` | `react` (storefront / BilditProvider — not `window.cmsDependencies`) |
| `react-router` | `Link`, `useNavigate`, `useLocation`, … |
| `@shopify/hydrogen` | `Image`, `Link`, `Money`, … |
| Tailwind classes | CSS via `@tailwindcss/browser` or compiled banner styles — not a JS import |

## VXE checklist

1. `ensureHostReactGlobals()` + `registerHostCmsDependencies()` in `entry.client.jsx` (no host React on `window.cmsDependencies`)
2. `BilditRoot` wraps the app (includes `BilditAdminBridge`)
3. `@tailwindcss/browser` in `root.jsx` so draft Tailwind classes resolve
4. CSP: `bilditCspDirectives` + `allowBilditIframeEmbedding()` in `entry.server.jsx` (include `cdn.jsdelivr.net`)
5. Hydrogen bundled admin script (CDN or `public/scripts/admin.js`) — not the Next.js download
6. `BILDIT_API_KEY` / `BILDIT_API_URL` in `.env` locally and as **Oxygen** env vars in production
7. Dev server URL/port matches the VXE preview URL

## Related

- [Next.js example](../nextjs-example) — App Router counterpart (`process.env` + `cmsDependencies.ts` + `bildit-cms-script.min.js`)
- [`@bildit-platform/hydrogen` README](https://www.npmjs.com/package/@bildit-platform/hydrogen)
- [Shopify Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
- [Oxygen environment variables](https://shopify.dev/docs/storefronts/headless/hydrogen/environments)
