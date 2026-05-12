import { NextRequest, NextResponse } from 'next/server';
import browserslistConfig from '@openagenda/browserslist-config';
import { isOutdatedBrowser } from '@openagenda/outdated-browser/middleware';
import getPreferredLocale from 'utils/getPreferredLocale';
import getSession from 'utils/getSession';
import parseAcceptLanguage from 'utils/parseAcceptLanguage';
import generateNonce from 'utils/generateNonce';
import CSP from 'utils/contentSecurityPolicy';
import buildAgendaCsp from 'utils/buildAgendaCsp';
import { REQUEST_AGENDA_HEADER, stashAgenda } from 'utils/requestAgenda';
import type { Agenda } from 'types';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from 'config/constants';

const MATCHER_REGEX =
  /^\/(api|_next\/static|_next\/image|favicon\.ico)($|\/).*$/;

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

const UID_SLUG_RE = /^(\d+)_(.+)$/;

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
  const uidMatch = eventSlug.match(UID_SLUG_RE);
  const path = uidMatch
    ? `api/agendas/slug/${agendaSlug}/events/${uidMatch[1]}`
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

const GONE_COPY: Record<string, { title: string; body: string; cta: string }> =
  {
    fr: {
      title: 'Événement introuvable',
      body: 'Cet événement a été supprimé et n’est plus disponible.',
      cta: 'Voir l’agenda',
    },
    en: {
      title: 'Event not found',
      body: 'This event has been removed and is no longer available.',
      cta: 'See agenda',
    },
  };

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c]!,
  );
}

function goneResponse(locale: string, agendaSlug: string): NextResponse {
  const copy = GONE_COPY[locale] ?? GONE_COPY.en;
  const safeAgenda = escapeHtml(agendaSlug);
  const body = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${copy.title} | OpenAgenda</title>
<style>
  *,*::before,*::after { box-sizing: border-box; }
  html,body { height: 100%; margin: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    color: #1a1a1a;
    background: #f7f7f8;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }
  .card {
    background: #fff;
    border-radius: 12px;
    padding: 2.5rem 2rem;
    max-width: 28rem;
    width: 100%;
    text-align: center;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06);
  }
  .code { font-size: 0.8rem; color: #888; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem; }
  h1 { font-size: 1.5rem; margin: 0 0 0.75rem; }
  p  { margin: 0 0 1.5rem; color: #4a4a4a; line-height: 1.5; }
  a.btn {
    display: inline-block;
    padding: 0.6rem 1.25rem;
    background: #1a73e8;
    color: #fff;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
  }
  a.btn:hover { background: #155bb5; }
</style>
</head>
<body>
  <main class="card">
    <div class="code">410 Gone</div>
    <h1>${copy.title}</h1>
    <p>${copy.body}</p>
    <a class="btn" href="/${locale}/${safeAgenda}">${copy.cta}</a>
  </main>
</body>
</html>`;
  return new NextResponse(body, {
    status: 410,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
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

export async function proxy(req: NextRequest) {
  if (MATCHER_REGEX.test(req.nextUrl.pathname)) {
    return;
  }

  const requestHeaders = new Headers(req.headers);
  const responseHeaders = new Headers();

  if (!req.cookies.has('oa')) {
    try {
      // Hard timeout: this runs on the hot path before any response. A slow
      // or unreachable upstream would otherwise wedge every cookieless first
      // visit. On timeout, we fall through without the priming cookie — the
      // session bootstraps on the next request.
      const noopResponse = await fetch(
        `${process.env.NEXT_API_INTERNAL_BASE_URL}/api/noop`,
        {
          headers: req.headers,
          signal: AbortSignal.timeout(500),
        },
      );
      const cookiesFromApi = noopResponse.headers.getSetCookie();

      if (cookiesFromApi.length > 0) {
        const currentRequestCookieHeader = requestHeaders.get('Cookie') || '';
        const newCookiesForRequestHeader = cookiesFromApi
          .map((c) => c.split(';')[0])
          .join('; ');

        requestHeaders.set(
          'Cookie',
          [currentRequestCookieHeader, newCookiesForRequestHeader]
            .filter(Boolean)
            .join('; '),
        );

        cookiesFromApi.forEach((cookie) => {
          responseHeaders.append('Set-Cookie', cookie);
        });
      }
    } catch (err) {
      // Best-effort only — noop cookie fetch is a warm-up, not critical path.
      if (process.env.NODE_ENV === 'development') {
        console.warn('proxy: noop cookie fetch failed', err);
      }
    }
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
  const session = getSession(req.cookies);
  const userLocale = session?.user?.culture;
  const qsLocale = req.nextUrl.searchParams.get('lang');

  // Note: no span enrichment here. The middleware runs in its own root
  // trace (`BaseServer.handleRequest` with `next.bubble: true`) which the
  // request-log processor filters out. Session enrichment for the logged
  // page render span is done by `SessionAttributesSpanProcessor` from the
  // captured `oa.user` cookie header attribute.

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
    if (APP_ROUTER_PATHS_REGEX.test(req.nextUrl.pathname)) {
      const eventRoute = matchEventPageRoute(req.nextUrl.pathname);
      if (eventRoute) {
        const gone = await isEventGone(
          eventRoute.agendaSlug,
          eventRoute.eventSlug,
          requestHeaders.get('Cookie') ?? '',
        );
        if (gone) {
          return goneResponse(urlLocale, eventRoute.agendaSlug);
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
  ],
};
