/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

/**
 * BILDIT + Hydrogen environment bindings (Oxygen / MiniOxygen).
 * BILDIT_API_URL: VXE host (admin-dev | admin-staging | admin.bildit.co).
 */
declare global {
  interface Env {
    /** VXE host root URL, e.g. https://admin-dev.bildit.co */
    BILDIT_API_URL?: string;
    BILDIT_API_KEY?: string;
  }
}
