import type { Metadata } from 'next';
import { SUPPORTED_LOCALES } from '@/src/config/constants';
import getLocale from '@/src/utils/getLocale';
import parseServerSearchParams from '@/src/utils/parseServerSearchParams';
import { fetchAgenda } from './_api';
import { parseApiError, handleApiError } from './_api/errors';
import AgendaShow from './_components/AgendaShow';
import AgendaError from './_components/AgendaError';

type Params = Promise<{ locale: string; agendaSlug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { agendaSlug } = await params;

  let agenda;
  try {
    agenda = await fetchAgenda(agendaSlug);
  } catch {
    return { title: 'OpenAgenda' };
  }

  const locale = await getLocale();
  const rootUrl = process.env.NEXT_PUBLIC_ROOT;
  const canonicalLocale = locale === 'io' ? 'en' : locale;
  const path = `/${agendaSlug}`;
  const canonicalUrl = `${rootUrl}/${canonicalLocale}${path}`;

  const languages: Record<string, string> = {};
  for (const key of SUPPORTED_LOCALES) {
    if (key === 'io') continue;
    languages[key] = `${rootUrl}/${key}${path}`;
  }
  languages['x-default'] = `${rootUrl}/en${path}`;

  const pageTitle = `${agenda.title} | OpenAgenda`;
  const description = agenda.description ?? undefined;
  const ogUrl = `${rootUrl}${path}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    robots: agenda.indexed
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      siteName: 'OpenAgenda',
      type: 'website',
      title: pageTitle,
      description,
      locale,
      alternateLocale: SUPPORTED_LOCALES.filter(
        (l) => l !== locale && l !== 'io',
      ),
      url: ogUrl,
      images: agenda.image ? [agenda.image] : undefined,
    },
    twitter: {
      card: 'summary',
      site: process.env.NEXT_PUBLIC_DOMAIN,
      title: pageTitle,
      description,
      images: agenda.image ? [agenda.image] : undefined,
    },
  };
}

export default async function AgendaPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { agendaSlug } = await params;
  const initialQuery = parseServerSearchParams(await searchParams);

  let agenda;
  try {
    agenda = await fetchAgenda(agendaSlug);
  } catch (e) {
    const { statusCode } = await parseApiError(e);
    if (statusCode === 401 || statusCode === 403) {
      return <AgendaError statusCode={statusCode} agendaSlug={agendaSlug} />;
    }
    await handleApiError(e);
  }

  return <AgendaShow agenda={agenda} initialQuery={initialQuery} />;
}
