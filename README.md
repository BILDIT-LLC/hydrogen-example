# BILDIT Hydrogen Example

Reference integration for `@bildit-platform/hydrogen` on a Shopify Hydrogen **2025.7.x** storefront.

Copy these patterns into your Hydrogen app. This folder is a skeleton — wire it into a Hydrogen project created with `npm create @shopify/hydrogen@latest`.

## Environment

```bash
# .env
BILDIT_API_URL=https://us-east1-bildit-dev.cloudfunctions.net
BILDIT_API_KEY=your-api-key
```

## Install

```bash
pnpm add @bildit-platform/hydrogen @bildit-platform/react-core
```

## Vite (`vite.config.js`)

No `next/*` aliases. Dedupe React and bundle BILDIT packages for SSR:

```javascript
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom', 'react-dom/client'],
  },
  ssr: {
    noExternal: [
      '@bildit-platform/hydrogen',
      '@bildit-platform/react-core',
      '@bildit-platform/engine',
    ],
  },
});
```

## Client bootstrap (`app/entry.client.jsx`)

Call **before** `hydrateRoot`:

```javascript
import { ensureHostReactGlobals, registerCmsDependencies } from '@bildit-platform/hydrogen';

ensureHostReactGlobals();
registerCmsDependencies();
```

## Root loader (`app/root.jsx`)

```javascript
import { getBannersForRequest, BilditRoot } from '@bildit-platform/hydrogen';

export async function loader({ request, context }) {
  const banners = await getBannersForRequest(request, context.env);
  return { banners, /* ...other loader data */ };
}

export default function App() {
  const { banners } = useRouteLoaderData('root');
  return (
    <BilditRoot banners={banners}>
      <Outlet />
    </BilditRoot>
  );
}
```

## CSP (`app/entry.server.jsx`)

```javascript
import {
  allowBilditIframeEmbedding,
  bilditCspDirectives,
} from '@bildit-platform/hydrogen';

const { nonce, header: baseHeader, NonceProvider } = createContentSecurityPolicy({
  shop: { /* ... */ },
  ...bilditCspDirectives,
});
const header = allowBilditIframeEmbedding(baseHeader);
responseHeaders.set('Content-Security-Policy', header);
```

## Slots

```jsx
import { SlotPlaceholder } from '@bildit-platform/hydrogen';

<SlotPlaceholder slotId="home-hero" />
<SlotPlaceholder slotId="home-promo" />
<SlotPlaceholder slotId="layout-footer" />
```

## Admin script (critical)

Use the **bundled** admin build (`USE_EXTERNAL_REACT=false`), not `cms-client-no-react`:

```bash
# In bildit-web-script
USE_EXTERNAL_REACT=false pnpm build
# Copy cms-client/scripts/admin.js → public/scripts/admin.js
```

Production CDN (bundled): `https://bildit-cdn.bilditon.com/cms-client/scripts/admin.js`

## Banner code imports

Hydrogen banners must import **native modules only**:

| Import | Module |
|--------|--------|
| `react` | `react` |
| `react-router` | `Link`, `useNavigate`, `useLocation`, … |
| `@shopify/hydrogen` | `Image`, `Link`, `Money`, … |

No `next/*` imports. Next-authored CMS banners require Hydrogen-specific templates.

## VEE checklist

1. `ensureHostReactGlobals()` + `registerCmsDependencies()` in `entry.client.jsx`
2. `BilditRoot` wraps the app (client-only provider mount)
3. `BilditAdminBridge` is included via `BilditRoot`
4. CSP: `bilditCspDirectives` + `allowBilditIframeEmbedding()`
5. Bundled `/scripts/admin.js` in `public/`
6. Dev server port matches CMS preview URL

## Library documentation

- Package: [@bildit-platform/hydrogen](https://www.npmjs.com/package/@bildit-platform/hydrogen)
- React core: [@bildit-platform/react-core](https://www.npmjs.com/package/@bildit-platform/react-core)
- BILDIT docs: [docs.bildit.co](https://docs.bildit.co/docs/getting-started)
