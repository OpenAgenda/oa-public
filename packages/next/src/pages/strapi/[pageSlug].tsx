import { GetServerSideProps, NextPage } from 'next';
import ky from 'ky';
import { getFallbackChain, DEFAULT_FALLBACK_MAP } from '@openagenda/intl';
import StrapiPage from 'views/StrapiPage';
import { fetchPageData } from 'utils/strapi';

interface PageData {
  documentId: string;
  locale: string;
  title: string;
  slug: string;
}

interface StrapiResponse {
  data: PageData[];
}

interface PageProps {
  intlMessages?: Record<string, string>;
  page: any;
  footer: any;
}

const SUPPORTED_STRAPI_LOCALES = ['en', 'fr'] as const;
type StrapiLocale = (typeof SUPPORTED_STRAPI_LOCALES)[number];

const STRAPI_FALLBACK_LOCALE: StrapiLocale = 'en';

function isSupportedStrapiLocale(l?: string): l is StrapiLocale {
  return !!l && (SUPPORTED_STRAPI_LOCALES as readonly string[]).includes(l);
}

async function fetchPageBySlug(
  APIBase: string,
  authToken: string,
  locale: string,
  slug: string,
): Promise<PageData | null> {
  const r = await ky(
    `${APIBase}/pages?locale=${locale}&filters[slug][$eq]=${encodeURIComponent(slug)}`,
    { headers: { Authorization: `Bearer ${authToken}` } },
  ).json<StrapiResponse>();

  return r.data?.[0] ?? null;
}

async function fetchPageByDocumentId(
  APIBase: string,
  authToken: string,
  documentId: string,
  locale: string,
): Promise<PageData | null> {
  try {
    const r = await ky(`${APIBase}/pages/${documentId}?locale=${locale}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    }).json<{ data: PageData }>();
    return r.data ?? null;
  } catch {
    return null;
  }
}

async function resolveDocumentIdFromAnyLocale(
  APIBase: string,
  authToken: string,
  slug: string,
): Promise<string | null> {
  try {
    const r = await ky(
      `${APIBase}/pages?locale=all&filters[slug][$eq]=${encodeURIComponent(slug)}`,
      { headers: { Authorization: `Bearer ${authToken}` } },
    ).json<StrapiResponse>();
    if (r.data?.length) return r.data[0].documentId;
  } catch {
    // fallback
  }

  for (const l of SUPPORTED_STRAPI_LOCALES) {
    const hit = await fetchPageBySlug(APIBase, authToken, l, slug);
    if (hit?.documentId) return hit.documentId;
  }

  return null;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  ctx,
) => {
  const { locale, query, resolvedUrl } = ctx;
  const {
    NEXT_STRAPI_API_BASE: APIBase,
    NEXT_STRAPI_API_AUTH_TOKEN: authToken,
  } = process.env;

  const pageSlug = query.pageSlug as string;

  const strapiLocaleChain: StrapiLocale[] = getFallbackChain(
    locale,
    DEFAULT_FALLBACK_MAP,
    STRAPI_FALLBACK_LOCALE,
  ).filter(isSupportedStrapiLocale);

  // 1) Essayer de résoudre directement dans la locale canonique
  let canonicalHit = await fetchPageBySlug(
    APIBase!,
    authToken!,
    strapiLocaleChain[0],
    pageSlug,
  );
  let documentId = canonicalHit?.documentId ?? null;
  let usedStrapiLocale: StrapiLocale = strapiLocaleChain[0];

  // 2) Si pas trouvé (slug dans une autre langue), tenter de mapper via n’importe quelle langue
  if (!documentId) {
    documentId = await resolveDocumentIdFromAnyLocale(
      APIBase!,
      authToken!,
      pageSlug,
    );
    if (!documentId) {
      // slug inconnu dans toutes les langues -> 404 (c'est ce que tu demandes)
      return { notFound: true };
    }
    for (const l of strapiLocaleChain) {
      const candidate = await fetchPageByDocumentId(
        APIBase!,
        authToken!,
        documentId,
        l,
      );
      if (candidate) {
        canonicalHit = candidate;
        usedStrapiLocale = l;
        break;
      }
    }

    // Si la page n’existe pas dans la locale canonique :
    // - si locale supportée => 404 (tu veux 404 si la traduction n’existe pas)
    // - si locale non supportée => on veut en, donc si même en n’existe pas => 404
    if (!canonicalHit) return { notFound: true };
  }

  // 3) Canonicaliser le slug : redirect uniquement si on a un slug canonique différent
  const canonicalSlug = canonicalHit.slug;
  if (canonicalSlug && canonicalSlug !== pageSlug) {
    const qs = resolvedUrl.includes('?')
      ? resolvedUrl.slice(resolvedUrl.indexOf('?'))
      : '';
    return {
      redirect: {
        destination: `/${locale}/p/${canonicalSlug}${qs}`,
        permanent: false,
      },
    };
  }

  // 4) Afficher le contenu (dans la locale canonique)
  const { intlMessages, page, footer } = await fetchPageData({
    APIBase: APIBase!,
    authToken: authToken!,
    documentId: canonicalHit.documentId,
    locale: usedStrapiLocale,
    fetchLocale: () => StrapiPage.fetchLocale(locale),
  });

  return { props: { intlMessages, page, footer } };
};

const Page: NextPage<PageProps> = ({ page, footer }) => (
  <StrapiPage page={page} footer={footer} />
);

export default Page;
