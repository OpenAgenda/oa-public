import { NextRequest, NextResponse } from 'next/server';
import browserslistConfig from '@openagenda/browserslist-config';
import { isOutdatedBrowser } from '@openagenda/outdated-browser/middleware';
import { getCookieCache } from '@openagenda/auth/server';
import getPreferredLocale from 'utils/getPreferredLocale';
import parseAcceptLanguage from 'utils/parseAcceptLanguage';
import parseEventUid from 'utils/parseEventUid';
import generateNonce from 'utils/generateNonce';
import CSP from 'utils/contentSecurityPolicy';
import buildAgendaCsp from 'utils/buildAgendaCsp';
import { REQUEST_AGENDA_HEADER, stashAgenda } from 'utils/requestAgenda';
import type { Agenda } from 'types';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from 'config/constants';

const MATCHER_REGEX =
  /^\/(api|_next\/static|_next\/image|favicon\.ico)($|\/).*$/;

const VISITOR_ID_COOKIE = 'oa.visitor_id';
// 400 days is the browser cap (Chrome/Firefox) on cookie max-age.
const VISITOR_ID_MAX_AGE_S = 400 * 24 * 60 * 60;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Any path under /:locale is considered App Router here. Proxy applies CSP
// and related headers when the URL already has a recognized locale prefix.
const APP_ROUTER_PATHS_REGEX = /^\/[a-z]{2,3}(\/|$)/;

// Reserved first segments under /:locale/ that are NOT an agenda route.
const RESERVED_FIRST_SEGMENTS = new Set([
  'agendas',
  'example',
  'embed',
  'p',
  'strapi',
]);

type MatchedRoute = { identifier: string; byUid: boolean };

// Routes that should pre-fetch their agenda in the proxy (for per-agenda CSP
// + downstream RSC dedup). Add new ones here. Each regex captures the agenda
// identifier as group 1.
const AGENDA_ROUTES: RegExp[] = [
  // /:locale/:agendaSlug
  /^\/[a-z]{2,3}\/([^/]+)\/?$/,
  // /:locale/:agendaSlug/events/:eventSlug
  /^\/[a-z]{2,3}\/([^/]+)\/events\/[^/]+\/?$/,
];

// Embed routes use the agenda *uid* in the URL, so we look them up via a
// different endpoint. Both shapes share the same CSP handling.
const EMBED_AGENDA_ROUTES: RegExp[] = [
  // /:locale/embed/agendas/:agendaUid
  /^\/[a-z]{2,3}\/embed\/agendas\/([^/]+)\/?$/,
  // /:locale/embed/agendas/:agendaUid/events/:eventSlug
  /^\/[a-z]{2,3}\/embed\/agendas\/([^/]+)\/events\/[^/]+\/?$/,
];

function matchAgendaPageRoute(pathname: string): MatchedRoute | null {
  for (const regex of EMBED_AGENDA_ROUTES) {
    const m = pathname.match(regex);
    if (m) return { identifier: m[1], byUid: true };
  }
  for (const regex of AGENDA_ROUTES) {
    const m = pathname.match(regex);
    if (m && !RESERVED_FIRST_SEGMENTS.has(m[1])) {
      return { identifier: m[1], byUid: false };
    }
  }
  return null;
}

function matchEventPageRoute(
  pathname: string,
): { agendaSlug: string; eventSlug: string } | null {
  const m = pathname.match(/^\/[a-z]{2,3}\/([^/]+)\/events\/([^/?#]+)\/?$/);
  if (m && !RESERVED_FIRST_SEGMENTS.has(m[1])) {
    return { agendaSlug: m[1], eventSlug: m[2] };
  }
  return null;
}

async function isEventGone(
  agendaSlug: string,
  eventSlug: string,
  cookie: string,
): Promise<boolean> {
  const uid = parseEventUid(eventSlug);
  const path = uid
    ? `api/agendas/slug/${agendaSlug}/events/${uid}`
    : `api/agendas/slug/${agendaSlug}/events/slug/${eventSlug}`;
  try {
    const res = await fetch(
      `${process.env.NEXT_API_INTERNAL_BASE_URL}/${path}`,
      {
        method: 'HEAD',
        headers: { Cookie: cookie },
        signal: AbortSignal.timeout(2000),
      },
    );
    return res.status === 404 && res.headers.get('x-resource-gone') === '1';
  } catch {
    return false;
  }
}

async function fetchAgendaForProxy(
  identifier: string,
  cookie: string,
  { byUid = false }: { byUid?: boolean } = {},
): Promise<Agenda | null> {
  const path = byUid
    ? `api/agendas/${identifier}?detailed=1&includeMemberSchema=1`
    : `api/agendas/slug/${identifier}?detailed=1&includeMemberSchema=1`;
  try {
    const res = await fetch(
      `${process.env.NEXT_API_INTERNAL_BASE_URL}/${path}`,
      { headers: { Cookie: cookie } },
    );
    if (!res.ok) return null;
    return (await res.json()) as Agenda;
  } catch {
    return null;
  }
}

// better-auth writes the session-cache cookie with a `__Secure-` prefix
// whenever the auth baseURL is https (`createCookieGetter`), but the standalone
// `getCookieCache` reader only assumes that prefix when `NODE_ENV==='production'`
// (or an explicit `isSecure`). On an https deployment running with
// `NODE_ENV !== 'production'` (e.g. dev/staging) the unprefixed read misses the
// `__Secure-oa.sess_data` cookie, so `userLocale` is lost and locale silently
// falls back to `fr`. Read both name variants so the session survives regardless.
async function getOaSessionCache(req: NextRequest) {
  const secret = process.env.OA_AUTH_SECRET;
  if (!secret) return null;
  const opts = { secret, cookiePrefix: 'oa', cookieName: 'sess_data' } as const;
  return (
    await getCookieCache(req, { ...opts, isSecure: true }) ??
    await getCookieCache(req, { ...opts, isSecure: false })
  );
}

export async function proxy(req: NextRequest) {
  if (MATCHER_REGEX.test(req.nextUrl.pathname)) {
    return;
  }

  const requestHeaders = new Headers(req.headers);
  const responseHeaders = new Headers();

  // Persistent visitor id for tracing: follows the browser across login /
  // logout cycles. cibul-node sets the same cookie when it sees the request
  // first; whichever app handles the first hit wins. Read downstream from
  // `http.request.header.cookie.oa.visitor_id` on the page-render root span.
  // Known gap: the very first request from a fresh browser doesn't yet carry
  // the cookie, so that span won't carry `visitor.id`. Tried bridging via
  // request headers, AsyncLocalStorage, scope mutation and direct span
  // setAttribute — all neutralized by Sentry's pre-middleware header
  // snapshot, `wrapMiddlewareWithSentry`'s isolation-scope fork, and the
  // separate async chain Next 16 uses for the page render.
  const existingVisitorId = req.cookies.get(VISITOR_ID_COOKIE)?.value;
  if (!existingVisitorId || !UUID_RE.test(existingVisitorId)) {
    const newVisitorId = crypto.randomUUID();
    const secureAttr = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    responseHeaders.append(
      'Set-Cookie',
      `${VISITOR_ID_COOKIE}=${newVisitorId}; Max-Age=${VISITOR_ID_MAX_AGE_S}; Path=/; HttpOnly; SameSite=Lax${secureAttr}`,
    );
  }

  /* outdated browser — forwarded to the App Router banner via a request
     header (Server Component reads it through next/headers) */
  if (
    isOutdatedBrowser(req.headers.get('user-agent'), {
      browsers: browserslistConfig,
      path: '/',
    })
  ) {
    requestHeaders.set('x-outdated-browser', '1');
  }

  /* locale redirection */

  // req.cookies.get('NEXT_LOCALE');
  const acceptLanguage = parseAcceptLanguage(
    req.headers.get('Accept-Language'),
  );
  const session = await getOaSessionCache(req);
  const userLocale = (session?.user as { culture?: string | null } | undefined)
    ?.culture;
  const qsLocale = req.nextUrl.searchParams.get('lang');

  // Extract locale from URL path (first segment) — i18n config is disabled so
  // we handle locale detection manually here.
  const firstSegment = req.nextUrl.pathname.split('/')[1] || '';
  const urlLocale = SUPPORTED_LOCALES.includes(firstSegment)
    ? firstSegment
    : null;

  const defaultLocale = userLocale || DEFAULT_LOCALE;

  const locale = getPreferredLocale(
    qsLocale,
    urlLocale,
    userLocale,
    ...acceptLanguage.map((al) => al.code),
  );

  if (!urlLocale) {
    // content language is different from user language
    if (locale !== defaultLocale) {
      // ?lang become ?cl
      if (qsLocale !== locale && !req.nextUrl.searchParams.has('cl')) {
        req.nextUrl.searchParams.set('cl', qsLocale);
      }
    }

    // is also an interface language
    if (SUPPORTED_LOCALES.includes(locale)) {
      req.nextUrl.searchParams.delete('lang');
    }

    const redirectUrl = new URL(
      `/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`,
      req.url,
    );
    return NextResponse.redirect(redirectUrl, {
      headers: responseHeaders,
    });
  } else {
    // Forward locale to App Router server components via header.
    requestHeaders.set('x-locale', urlLocale);

    // Generate a CSP nonce per request, exposed to App Router server components
    // via the x-nonce request header. Pages Router keeps its per-page nonce
    // generation in getServerSideProps for now.
    const nonce = generateNonce();
    requestHeaders.set('x-nonce', nonce);

    // CSP for App Router routes: Report-Only only (no enforce header). The
    // report-only header doesn't block anything, so it's safe to emit in dev
    // even though Turbopack/extensions inject un-nonced inline code.
    let eventGone = false;
    if (APP_ROUTER_PATHS_REGEX.test(req.nextUrl.pathname)) {
      const eventRoute = matchEventPageRoute(req.nextUrl.pathname);
      if (eventRoute) {
        eventGone = await isEventGone(
          eventRoute.agendaSlug,
          eventRoute.eventSlug,
          requestHeaders.get('Cookie') ?? '',
        );
        if (eventGone) {
          // Let the App Router page render its themed 410 view directly (no
          // event re-fetch), and tell crawlers the URL is permanently gone.
          requestHeaders.set('x-event-gone', '1');
          responseHeaders.set('X-Robots-Tag', 'noindex');
          responseHeaders.set('cache-control', 'no-store');
        }
      }

      const agendaRoute = matchAgendaPageRoute(req.nextUrl.pathname);

      if (agendaRoute) {
        // Pre-fetch the agenda here to build its tailored CSP, then stash
        // it so the downstream Server Component consumes it instead of
        // issuing a duplicate HTTP fetch (request-scoped dedup, no TTL).
        const agenda = await fetchAgendaForProxy(
          agendaRoute.identifier,
          requestHeaders.get('Cookie') ?? '',
          { byUid: agendaRoute.byUid },
        );
        if (agenda) {
          const reqId = crypto.randomUUID();
          stashAgenda(reqId, { agenda });
          requestHeaders.set(REQUEST_AGENDA_HEADER, reqId);
        }
        responseHeaders.set(
          'Content-Security-Policy-Report-Only',
          buildAgendaCsp(agenda, nonce),
        );
      } else {
        // Default CSP for App Router routes without per-route customization.
        responseHeaders.set(
          'Content-Security-Policy-Report-Only',
          CSP({ props: { nonce } }),
        );
      }
      responseHeaders.set('x-nonce', nonce);
    }

    if (eventGone) {
      // Render the real event route (navbar, agenda header, themed UI) but
      // with a true 410 status. Middleware doesn't re-run on the rewrite, so
      // targeting the same URL is safe and won't loop.
      return NextResponse.rewrite(req.nextUrl, {
        request: {
          headers: requestHeaders,
        },
        headers: responseHeaders,
        status: 410,
      });
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
      headers: responseHeaders,
    });
  }
}

export const config = {
  matcher: [
    '/',
    // Single-segment URLs — bare slug or locale landing page.
    '/([^/]+)',
    // Locale-prefixed URLs — middleware forwards x-locale + CSP nonce. Scoped
    // to the supported locale list so garbage multi-segment URLs
    // (e.g. /inexistant/foundation-…) don't trigger a redirect that would
    // loop against the fallback rewrite in next.config.mjs.
    // Must stay a literal: Next statically analyzes config.matcher at build
    // time. Keep in sync with SUPPORTED_LOCALES (config/constants).
    '/(en|fr|de|it|es|br|ca|eu|oc|io|nl)/:path*',
    // Pages Router legacy shapes that live outside the locale prefix.
    '/([^/]+)/events/([^/]+)',
    '/embed/agendas/:path*',
    '/p/:slug',
    '/strapi/:slug',
    // Catches the cibul-node /signup → /auth/signup 301 (no locale prefix) so
    // the no-locale branch above can 307 it to /:locale/auth/signup.
    '/auth/:path*',
    // Settings sub-paths (/settings/<section>) so a no-locale deep link gets
    // the locale prefix; bare /settings is already covered by '/([^/]+)'.
    '/settings/:path*',
  ],
};
