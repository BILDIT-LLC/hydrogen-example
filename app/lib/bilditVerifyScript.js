/** VEE setup verify script — must match the tag from BILDIT admin tutorial. */
export const BILDIT_CLIENT_SCRIPT =
  'https://bildit-staging-cdn.bilditon.com/cms-client-no-react/bildit.min.js';

/**
 * Raw HTML snippet for BILDIT Verify (server-side injection before </head>).
 * @param {string | undefined} apiKey
 */
export function getBilditVerifyScriptTag(apiKey) {
  if (!apiKey) return '';
  return `<script src="${BILDIT_CLIENT_SCRIPT}" data-bildit-key="${apiKey}"></script>`;
}

/**
 * Inject the BILDIT verify script into HTML document responses.
 * @param {string} html
 * @param {string | undefined} apiKey
 */
export function injectBilditVerifyScript(html, apiKey) {
  const scriptTag = getBilditVerifyScriptTag(apiKey);
  if (!scriptTag || html.includes(BILDIT_CLIENT_SCRIPT)) {
    return html;
  }

  if (html.includes('</head>')) {
    return html.replace('</head>', `${scriptTag}</head>`);
  }

  return html;
}
