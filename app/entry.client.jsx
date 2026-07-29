import {
  ensureHostReactGlobals,
  registerCmsDependencies,
} from '@bildit-platform/hydrogen';
import {HydratedRouter} from 'react-router/dom';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {NonceProvider} from '@shopify/hydrogen';

ensureHostReactGlobals();
registerCmsDependencies();

if (!window.location.origin.includes('webcache.googleusercontent.com')) {
  startTransition(() => {
    const existingNonce = document.querySelector('script[nonce]')?.nonce;

    hydrateRoot(
      document,
      <StrictMode>
        <NonceProvider value={existingNonce}>
          <HydratedRouter />
        </NonceProvider>
      </StrictMode>,
    );
  });
}
