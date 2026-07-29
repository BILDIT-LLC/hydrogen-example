# Admin script

Place the **bundled** BILDIT admin script here as `admin.js`.

Build from `bildit-web-script`:

```bash
USE_EXTERNAL_REACT=false pnpm build
cp path/to/cms-client/scripts/admin.js ./admin.js
```

Do **not** use `cms-client-no-react` on Hydrogen — it causes React identity mismatches.
