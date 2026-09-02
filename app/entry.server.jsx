import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';
import {
  allowBilditIframeEmbedding,
  bilditCspDirectives,
} from '@bildit-platform/hydrogen/server';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} reactRouterContext
 * @param {HydrogenRouterContextProvider} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
  context,
) {
  const {nonce, header: baseHeader, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    ...bilditCspDirectives,
    // BWC-5023: Live Editor compiles templates with a blob worker + SWC WASM
    workerSrc: [
      "'self'",
      'blob:',
      'https://bildit-cdn.bilditon.com',
      'https://bildit-staging-cdn.bilditon.com',
    ],
    scriptSrc: [
      ...(bilditCspDirectives.scriptSrc || []),
      // 'unsafe-eval' is required for BILDIT Live Editor on any Hydrogen storefront using
      // CSP (not just local dev): SWC WASM compile (WebAssembly.instantiateStreaming) is
      // blocked without it. Same pattern the CMS uses in its template preview iframe.
      "'unsafe-eval'",
      'blob:',
      'https://bildit-cdn.bilditon.com',
      'https://bildit-staging-cdn.bilditon.com',
      'https://unpkg.com',
      'https://cdn.jsdelivr.net',
      ...(import.meta.env.DEV
        ? ['http://localhost:3333', 'http://127.0.0.1:3333']
        : []),
    ],
    connectSrc: [
      ...(bilditCspDirectives.connectSrc || []),
      'https://bildit-cdn.bilditon.com',
      'https://bildit-staging-cdn.bilditon.com',
      'https://unpkg.com',
      'https://cdn.jsdelivr.net',
      ...(import.meta.env.DEV
        ? ['http://localhost:3333', 'http://127.0.0.1:3333']
        : []),
    ],
  });

  const header = allowBilditIframeEmbedding(baseHeader);

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/hydrogen').HydrogenRouterContextProvider} HydrogenRouterContextProvider */
/** @typedef {import('react-router').EntryContext} EntryContext */
