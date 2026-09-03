import {registerCmsDependencies} from '@bildit-platform/hydrogen/client';

/**
 * Extra host modules for banner `import`s — same job as Next.js cmsDependencies.ts.
 *
 * Do not put `react` / `react/jsx-runtime` here. Hydrogen is React 18 and Live
 * Editor admin.js is React 19; that mismatch is minified React error #525.
 *
 * Tailwind is CSS, not a JS module. Load `@tailwindcss/browser` in root.jsx
 * (same runtime the VXE preview uses). Do not register `tailwindcss` here.
 */
export const extraDependenciesConfig = {
  // 'date-fns': {module: DateFns},
};

const HOST_REACT_KEYS = [
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom',
  'react-dom/client',
];

/** Call in entry.client.jsx before hydrateRoot. */
export function registerHostCmsDependencies() {
  registerCmsDependencies(extraDependenciesConfig);

  // Published SDKs still copied React 18 onto window.cmsDependencies.
  // Strip it so Live Editor interprets banners with its own React 19.
  const cms = {...(window.cmsDependencies || {})};
  for (const key of HOST_REACT_KEYS) {
    delete cms[key];
  }
  for (const [key, config] of Object.entries(extraDependenciesConfig)) {
    if (config?.module) cms[key] = {module: config.module};
  }
  window.cmsDependencies = cms;
}
