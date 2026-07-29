/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

/**
 * BILDIT + Hydrogen environment bindings (Oxygen / MiniOxygen).
 * Declared here so `context.env.BILDIT_*` is typed in loaders.
 */
declare global {
  interface Env {
    BILDIT_API_URL?: string;
    BILDIT_API_KEY?: string;
  }
}
