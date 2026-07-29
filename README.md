# @bildit-platform/hydrogen Example

Shopify Hydrogen storefront demonstrating **BILDIT CMS** integration with [`@bildit-platform/hydrogen`](https://www.npmjs.com/package/@bildit-platform/hydrogen).

This is the Hydrogen counterpart to [`nextjs-example`](../nextjs-example). It shows:

- **`getBannersForRequest`** — server-side banner fetch by path + preview date
- **`SlotPlaceholder`** — slot rendering with `fallback` and `forceFallback`
- **`StylePlaceholder`** — CMS-managed CSS injection into `head`
- **VEE Live Editor** — admin bridge + CSP helpers for iframe embedding

Uses Shopify’s mock.shop data source by default (no store connection required).

## Requirements

- Node.js 22+ recommended (Hydrogen 2026.x); 20+ may work with engine warnings
- npm, yarn, or pnpm

## Install

```bash
cd hydrogen-example
npm install
```

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
BILDIT_API_URL=https://your-site.web.app   # CMS instance root (no path)
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
| `BILDIT_API_URL` | ✅ | Root URL of your CMS instance (SDK appends `/remote-webbanners_v1_4`) |

Types for these bindings are declared in `env.d.ts`.

## Run

```bash
npm run dev
```

## Dependency registration (Hydrogen vs Next.js)

**Yes — same job, different shape.**

| | Next.js | Hydrogen |
|---|---|---|
| Config file | You build `cmsDependencies.ts` | Package exports `hydrogenDependenciesConfig` |
| Wired into provider | `extraDependenciesConfig={cmsDependencies}` on `BilditProvider` | Built in as `coreDependenciesConfig` on Hydrogen’s `BilditProvider` |
| Live Editor | Same modules must be available to the admin script | `registerCmsDependencies()` in `entry.client.jsx` copies the map onto `window.cmsDependencies` |

### What’s registered by default

`hydrogenDependenciesConfig` includes Hydrogen-native modules only (no `next/*`):

- `react`, `react/jsx-runtime`, `react/jsx-dev-runtime`
- `react-dom`, `react-dom/client`
- `react-router`
- `@shopify/hydrogen`

### Reference in this repo

```jsx
// app/entry.client.jsx — call BEFORE hydrateRoot
import {
  ensureHostReactGlobals,
  registerCmsDependencies,
} from '@bildit-platform/hydrogen/client';

ensureHostReactGlobals();
registerCmsDependencies(); // ← registers hydrogenDependenciesConfig
```

You do **not** need a separate `cmsDependencies.ts` for the defaults. Custom template modules (icon libs, shared UI) should be added the same way as Next — extend the dependency map used by the engine / Live Editor (e.g. merge into `window.cmsDependencies` after `registerCmsDependencies()`, or pass `extraDependenciesConfig` when using `BilditProvider` directly). Banner code must import Hydrogen-native modules (`react-router`, `@shopify/hydrogen`), not `next/*`.

## Visual Editor bridge (Hydrogen vs Next.js)

**Related approach, different script.**

| | Next.js | Hydrogen |
|---|---|---|
| Script artifact | VEE download: `bildit-cms-script.min.js` | **Bundled-React** admin: `admin.js` (`USE_EXTERNAL_REACT=false`) |
| Default hosting | `public/scripts/bildit-cms-script.min.js` | CDN: `https://bildit-cdn.bilditon.com/cms-client-hydrogen/scripts/admin.js` |
| Bridge | Inline `postMessage` bridge in layout | Exported `BilditAdminBridge` (included by `BilditRoot`) |
| Optional local file | Required for the Next guide | Optional — override `adminScript` on `BilditRoot` |

Walkthrough (general VEE script concepts):

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

1. **CSP is required for Live Editor.** This example spreads `bilditCspDirectives` into Hydrogen’s `createContentSecurityPolicy` and runs `allowBilditIframeEmbedding(header)` so VEE can iframe the storefront (`frame-ancestors` for admin.bildit.co, localhost, `*.web.app`, etc.). Without this, the editor iframe / script load fails silently.
2. **`scriptSrc` / `connectSrc`** must allow `https://bildit-cdn.bilditon.com` (and your Functions host if not already covered). Sentry ingest hosts are included for admin error reporting.
3. **Do not replace Shopify’s CSP wholesale** — merge Bildit directives so `cdn.shopify.com` / checkout stay intact.
4. **Caching:** banner responses are fetched per request in the root loader; Oxygen/CDN page caching can still serve stale HTML. Prefer short cache or revalidate after schedule changes. The admin script URL in this example appends a cache-busting query when injected by the bridge.
5. **Dev URL / port** in the VEE website settings must match your Hydrogen preview URL (`npm run dev`).

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

Uses `BILDIT_API_URL` + `BILDIT_API_KEY` from Oxygen/env. Location = request pathname; preview date comes from the VEE URL param.

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

- `app/entry.client.jsx` — `ensureHostReactGlobals()` + `registerCmsDependencies()` before hydrate
- `app/root.jsx` — wrap the app in `<BilditRoot banners={…} adminScript={…}>`
- `app/entry.server.jsx` — `bilditCspDirectives` + `allowBilditIframeEmbedding()`
- `vite.config.js` — SSR `noExternal` for `@bildit-platform/*` packages

### 5. Preview date

```bash
http://localhost:3000/?bildit_preview_date=2026-02-15T00:00:00.000Z
```

## Project layout

```
app/
  entry.client.jsx          # React globals + CMS deps
  entry.server.jsx          # CSP + iframe embedding
  root.jsx                  # getBannersForRequest + BilditRoot
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
| `react` | `react` |
| `react-router` | `Link`, `useNavigate`, `useLocation`, … |
| `@shopify/hydrogen` | `Image`, `Link`, `Money`, … |

## VEE checklist

1. `ensureHostReactGlobals()` + `registerCmsDependencies()` in `entry.client.jsx`
2. `BilditRoot` wraps the app (includes `BilditAdminBridge`)
3. CSP: `bilditCspDirectives` + `allowBilditIframeEmbedding()` in `entry.server.jsx`
4. Hydrogen bundled admin script (CDN or `public/scripts/admin.js`) — not the Next.js download
5. `BILDIT_API_KEY` / `BILDIT_API_URL` in `.env` locally and as **Oxygen** env vars in production
6. Dev server URL/port matches the CMS preview URL

## Related

- [Next.js example](../nextjs-example) — App Router counterpart (`process.env` + `cmsDependencies.ts` + `bildit-cms-script.min.js`)
- [`@bildit-platform/hydrogen` README](https://www.npmjs.com/package/@bildit-platform/hydrogen)
- [Shopify Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
- [Oxygen environment variables](https://shopify.dev/docs/storefronts/headless/hydrogen/environments)
