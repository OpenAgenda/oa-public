import { cache } from 'react';
import ky, { HTTPError } from 'ky';
import { getFallbackChain, DEFAULT_FALLBACK_MAP } from '@openagenda/intl';
import { fetchPageData } from '@/src/utils/strapi';
import type { StrapiPageData } from '@/src/components/strapi/types';

function is404(err: unknown): boolean {
  return err instanceof HTTPError && err.response.status === 404;
}

export const SUPPORTED_STRAPI_LOCALES = ['en', 'fr', 'nl'] as const;
export type StrapiLocale = (typeof SUPPORTED_STRAPI_LOCALES)[number];

const STRAPI_FALLBACK_LOCALE: StrapiLocale = 'en';

interface PageData {
  documentId: string;
  locale: string;
  title: string;
  slug: string;
}

interface StrapiResponse {
  data: PageData[];
}

export function isSupportedStrapiLocale(l?: string): l is StrapiLocale {
  return !!l && (SUPPORTED_STRAPI_LOCALES as readonly string[]).includes(l);
}

function strapiHeaders() {
  return { Authorization: `Bearer ${process.env.NEXT_STRAPI_API_AUTH_TOKEN}` };
}

function apiBase() {
  return process.env.NEXT_STRAPI_API_BASE!;
}

async function fetchPageBySlug(
  locale: string,
  slug: string,
): Promise<PageData | null> {
  const r = await ky(
    `${apiBase()}/pages?locale=${locale}&filters[slug][$eq]=${encodeURIComponent(slug)}`,
    { headers: strapiHeaders() },
  ).json<StrapiResponse>();
  return r.data?.[0] ?? null;
}

async function fetchPageByDocumentId(
  documentId: string,
  locale: string,
): Promise<PageData | null> {
  try {
    const r = await ky(`${apiBase()}/pages/${documentId}?locale=${locale}`, {
      headers: strapiHeaders(),
    }).json<{ data: PageData }>();
    return r.data ?? null;
  } catch (err) {
    if (is404(err)) return null;
    throw err;
  }
}

async function resolveDocumentIdFromAnyLocale(
  slug: string,
): Promise<string | null> {
  try {
    const r = await ky(
      `${apiBase()}/pages?locale=all&filters[slug][$eq]=${encodeURIComponent(slug)}`,
      { headers: strapiHeaders() },
    ).json<StrapiResponse>();
    if (r.data?.length) return r.data[0].documentId;
  } catch (err) {
    if (!is404(err)) throw err;
    // 404 → fall through to per-locale lookup
  }

  for (const l of SUPPORTED_STRAPI_LOCALES) {
    const hit = await fetchPageBySlug(l, slug);
    if (hit?.documentId) return hit.documentId;
  }

  return null;
}

export type StrapiPageResolution =
  | { kind: 'notFound' }
  | { kind: 'redirectHome' }
  | {
      kind: 'ok';
      page: StrapiPageData;
      footer: any;
      canonicalSlug: string;
      strapiLocale: StrapiLocale;
    };

// Cached by (locale, pageSlug) only — rawSearch and redirect URL building
// live in the caller so the same resolution is shared by generateMetadata,
// page.tsx, and any future layout that needs Strapi data for this slug.
export const resolveStrapiPage = cache(
  async (locale: string, pageSlug: string): Promise<StrapiPageResolution> => {
    const strapiLocaleChain: StrapiLocale[] = getFallbackChain(
      locale,
      DEFAULT_FALLBACK_MAP,
      STRAPI_FALLBACK_LOCALE,
    ).filter(isSupportedStrapiLocale);

    const preferredLocale = strapiLocaleChain[0];
    let canonicalHit = await fetchPageBySlug(preferredLocale, pageSlug);
    let usedStrapiLocale: StrapiLocale = preferredLocale;

    if (!canonicalHit) {
      const documentId = await resolveDocumentIdFromAnyLocale(pageSlug);
      if (!documentId) return { kind: 'notFound' };
      for (const l of strapiLocaleChain) {
        const candidate = await fetchPageByDocumentId(documentId, l);
        if (candidate) {
          canonicalHit = candidate;
          usedStrapiLocale = l;
          break;
        }
      }
    }

    if (!canonicalHit) {
      return { kind: 'redirectHome' };
    }

    const { page, footer } = await fetchPageData({
      APIBase: apiBase(),
      authToken: process.env.NEXT_STRAPI_API_AUTH_TOKEN!,
      documentId: canonicalHit.documentId,
      locale: usedStrapiLocale,
    });

    return {
      kind: 'ok',
      page,
      footer,
      canonicalSlug: canonicalHit.slug,
      strapiLocale: usedStrapiLocale,
    };
  },
);
