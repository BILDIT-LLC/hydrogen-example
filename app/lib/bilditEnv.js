/**
 * BILDIT_API_URL must be a full URL (VXE host, e.g. https://admin-dev.bildit.co).
 * @param {string | undefined} apiUrl
 */
export function normalizeBilditApiUrl(apiUrl) {
  const trimmed = apiUrl?.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** @param {Env} env */
export function withNormalizedBilditEnv(env) {
  return {...env, BILDIT_API_URL: normalizeBilditApiUrl(env.BILDIT_API_URL)};
}
