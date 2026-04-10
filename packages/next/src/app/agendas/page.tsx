import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SUPPORTED_LOCALES } from 'config/constants';
import getIntl from 'app/utils/getIntl';
import { fetchNetwork, fetchLocationSet } from './api';
import messages from './messages';
import AgendasContent from './AgendasContent';
import AgendasSkeleton from './AgendasSkeleton';

type SearchParams = Promise<{
  search?: string;
  network?: string;
  locationSet?: string;
  after?: string;
}>;

async function getPageTitle(
  search?: string,
  networkTitle?: string,
  locationSetTitle?: string,
) {
  const intl = await getIntl();
  const base = intl.formatMessage(messages.pageTitle);

  if (search || networkTitle || locationSetTitle) {
    return `${search || networkTitle || locationSetTitle} - ${base} | OpenAgenda`;
  }

  return `${base} | OpenAgenda`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const intl = await getIntl();

  let networkTitle: string | undefined;
  let locationSetTitle: string | undefined;

  if (params.network) {
    try {
      const network = (await fetchNetwork(params.network)) as {
        title?: string;
      };
      networkTitle = network?.title;
    } catch {
      // ignore
    }
  }

  if (params.locationSet) {
    try {
      const locationSet = (await fetchLocationSet(params.locationSet)) as {
        title?: string;
      };
      locationSetTitle = locationSet?.title;
    } catch {
      // ignore
    }
  }

  const title = await getPageTitle(
    params.search,
    networkTitle,
    locationSetTitle,
  );

  const rootUrl = process.env.NEXT_PUBLIC_ROOT;
  const canonicalLocale = intl.locale === 'io' ? 'en' : intl.locale;
  const canonicalUrl = `${rootUrl}/${canonicalLocale}/agendas`;

  const alternates: Record<string, string> = {};
  for (const key of SUPPORTED_LOCALES) {
    if (key === 'io') continue;
    alternates[key] = `${rootUrl}/${key}/agendas`;
  }
  alternates['x-default'] = `${rootUrl}/en/agendas`;

  const hasSearchQuery = !!params.search || !!params.after;

  return {
    title,
    alternates: {
      canonical: canonicalUrl,
      languages: alternates,
    },
    robots: {
      index: !hasSearchQuery,
      follow: true,
    },
  };
}

export default async function AgendasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <Suspense fallback={<AgendasSkeleton />}>
      <AgendasContent searchParams={params} />
    </Suspense>
  );
}
