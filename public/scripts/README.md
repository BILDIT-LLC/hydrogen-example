# Admin script (optional local host)

Hydrogen’s default is the **CDN** bundled-React build, wired via `BilditRoot`:

```
https://bildit-cdn.bilditon.com/cms-client-hydrogen/scripts/admin.js
```

You usually do **not** need a file here. Prefer the CDN unless you need an offline/custom build.

## If you host locally

1. Build the **bundled** admin script (`USE_EXTERNAL_REACT=false`) — **not** `cms-client-no-react` / Next’s `bildit-cms-script.min.js`.
2. Place it as `public/scripts/admin.js`.
3. Pass that path to `BilditRoot`:

```jsx
<BilditRoot
  banners={banners}
  adminScript="/scripts/admin.js"
>
```

Do **not** reuse the Next.js VEE download (`bildit-cms-script.min.js`) on Hydrogen — React identity mismatches will break Live Editor rendering.
