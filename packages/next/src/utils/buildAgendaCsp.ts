import type { Agenda } from '@/src/types';
import CSP, { DEFAULT_DIRECTIVES } from './contentSecurityPolicy';
import { normalizeUrl as normalizeMatomoUrl } from './addMatomoTracker';

const GOOGLE_ANALYTICS_HOSTS = [
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://*.googletagmanager.com',
  'https://*.g.doubleclick.net',
  'https://*.google.com',
];

// gtag.js / GA4 also loads scripts from these hosts; the connect/img list
// alone isn't enough — without script-src the loader is CSP-blocked.
const GOOGLE_ANALYTICS_SCRIPT_HOSTS = [
  'https://*.googletagmanager.com',
  'https://*.google-analytics.com',
];

/**
 * Builds the full CSP for an agenda route, based on its tracking settings.
 * Called by the proxy to emit a per-agenda `Content-Security-Policy(-Report-Only)`
 * response header.
 */
export default function buildAgendaCsp(
  agenda: Agenda | null,
  nonce: string,
): string {
  const matomoUrl = agenda?.settings?.tracking?.matomoUrl;
  const googleAnalytics = agenda?.settings?.tracking?.googleAnalytics;
  const matomoHost = matomoUrl
    ? `https://${normalizeMatomoUrl(matomoUrl)}`
    : null;

  const trackingHosts = [
    ...matomoHost ? [matomoHost] : [],
    ...googleAnalytics ? GOOGLE_ANALYTICS_HOSTS : [],
  ];

  const trackingScriptHosts = [
    ...matomoHost ? [matomoHost] : [],
    ...googleAnalytics ? GOOGLE_ANALYTICS_SCRIPT_HOSTS : [],
  ];

  return CSP({
    props: { nonce },
    directives: {
      ...DEFAULT_DIRECTIVES,
      scriptSrc: [...DEFAULT_DIRECTIVES.scriptSrc, ...trackingScriptHosts],
      connectSrc: [...DEFAULT_DIRECTIVES.connectSrc, ...trackingHosts],
      imgSrc: [...DEFAULT_DIRECTIVES.imgSrc, ...trackingHosts],
    },
  });
}
