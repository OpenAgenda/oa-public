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

type MatchedRoute = { slug: string };

// Routes that should pre-fetch their agenda in the proxy (for per-agenda CSP
// + downstream RSC dedup). Add new ones here. Each regex captures the agenda
// slug as group 1.
const AGENDA_ROUTES: RegExp[] = [
  // /:locale/:agendaSlug
  /^\/[a-z]{2,3}\/([^/]+)\/?$/,
  // /:locale/:agendaSlug/events/:eventSlug
  /^\/[a-z]{2,3}\/([^/]+)\/events\/[^/]+\/?$/,
];

function matchAgendaPageRoute(pathname: string): MatchedRoute | null {
  for (const regex of AGENDA_ROUTES) {
    const m = pathname.match(regex);
    if (m && !RESERVED_FIRST_SEGMENTS.has(m[1])) return { slug: m[1] };
  }
  return null;
}

async function fetchAgendaForProxy(
  agendaSlug: string,
  cookie: string,
): Promise<Agenda | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_API_INTERNAL_BASE_URL}/api/agendas/slug/${agendaSlug}?detailed=1&includeMemberSchema=1`,
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
  const userLocale = getSession(req.cookies)?.user?.culture;
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
    if (APP_ROUTER_PATHS_REGEX.test(req.nextUrl.pathname)) {
      const agendaRoute = matchAgendaPageRoute(req.nextUrl.pathname);

      if (agendaRoute) {
        // Pre-fetch the agenda here to build its tailored CSP, then stash
        // it so the downstream Server Component consumes it instead of
        // issuing a duplicate HTTP fetch (request-scoped dedup, no TTL).
        const agenda = await fetchAgendaForProxy(
          agendaRoute.slug,
          requestHeaders.get('Cookie') ?? '',
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
  ],
};
