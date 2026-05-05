import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SUPPORTED_LOCALES } from '@/src/config/constants';
import getLocale from '@/src/utils/getLocale';
import stringifySearchParams from '@/src/utils/stringifySearchParams';
import { videoPoster } from '@/src/utils/strapi';
import { resolveStrapiPage, isSupportedStrapiLocale } from './_api';
import StrapiPage from './_components/StrapiPage';
import StrapiPageClient from './_components/StrapiPageClient';

type Params = Promise<{ locale: string; pageSlug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function extractOgImage(
  segment: any,
): { url: string; width?: number; height?: number } | null {
  if (!segment) return null;
  if (segment.image?.formats?.large) return segment.image.formats.large;
  if (segment.video) return { url: videoPoster };
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { pageSlug } = await params;
  const locale = await getLocale();
  const resolution = await resolveStrapiPage(locale, pageSlug);

  if (resolution.kind !== 'ok') {
    return { title: 'OpenAgenda' };
  }

  const { page } = resolution;
  const rootUrl = process.env.NEXT_PUBLIC_ROOT;
  const canonicalLocale = locale === 'io' ? 'en' : locale;
  const path = `/p/${resolution.canonicalSlug}`;
  const canonicalUrl = `${rootUrl}/${canonicalLocale}${path}`;

  const languages: Record<string, string> = {};
  for (const key of SUPPORTED_LOCALES) {
    if (key === 'io') continue;
    languages[key] = `${rootUrl}/${key}${path}`;
  }
  languages['x-default'] = `${rootUrl}/en${path}`;

  const pageTitle = `${page.title} | OpenAgenda`;
  const description = page.description ?? undefined;
  const ogImage = extractOgImage(page.Segments?.[0]);

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    robots: { index: true, follow: true },
    openGraph: {
      siteName: 'OpenAgenda',
      type: 'website',
      title: pageTitle,
      description,
      locale,
      alternateLocale: SUPPORTED_LOCALES.filter(
        (l) => l !== locale && l !== 'io',
      ),
      url: canonicalUrl,
      images: ogImage?.url
        ? [{ url: ogImage.url, width: ogImage.width, height: ogImage.height }]
        : undefined,
    },
  };
}

export default async function StrapiPageRoute({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { pageSlug } = await params;
  const locale = await getLocale();
  const resolution = await resolveStrapiPage(locale, pageSlug);

  if (resolution.kind === 'notFound') notFound();

  const search = stringifySearchParams(await searchParams);
  const qs = search ? `?${search}` : '';

  if (resolution.kind === 'redirectHome') redirect(`/${locale}${qs}`);

  if (
    resolution.canonicalSlug !== pageSlug &&
    isSupportedStrapiLocale(locale)
  ) {
    redirect(`/${locale}/p/${resolution.canonicalSlug}${qs}`);
  }

  return (
    <StrapiPageClient page={resolution.page}>
      <StrapiPage page={resolution.page} footer={resolution.footer} />
    </StrapiPageClient>
  );
}
