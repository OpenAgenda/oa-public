import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import qs from 'qs';
import { SUPPORTED_LOCALES } from '@/src/config/constants';
import getLocale from '@/src/utils/getLocale';
import { fetchAgenda, fetchEvent } from '../../_api';
import { parseApiError, handleApiError } from '../../_api/errors';
import EventError from './_components/EventError';
import EventShowWrapper from './_components/EventShowWrapper';
import getContentLocale from './_utils/getContentLocale';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const UID_SLUG_RE = /^(\d+)_(.+)$/;

type Params = Promise<{
  locale: string;
  agendaSlug: string;
  eventSlug: string;
}>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { agendaSlug, eventSlug } = await params;
  const sp = await searchParams;
  const locale = await getLocale();

  let agenda;
  let eventResponse;
  try {
    [agenda, eventResponse] = await Promise.all([
      fetchAgenda(agendaSlug, { includeMemberSchema: true }),
      fetchEvent(agendaSlug, eventSlug),
    ]);
  } catch {
    return { title: 'OpenAgenda' };
  }

  const event = eventResponse?.event;
  if (!event) return { title: 'OpenAgenda' };

  // `?cl` overrides the displayed content language (e.g. /en/...?cl=fr shows
  // FR title/description). Mirror the same resolution as the client EventShow
  // so <head> and <body> stay in sync. Canonical/alternates intentionally
  // ignore `?cl` — it's user personalization, not an indexable variant.
  const cl = Array.isArray(sp.cl) ? sp.cl[0] : sp.cl;
  const contentLocale = getContentLocale(
    Object.keys(event.title ?? {}),
    cl,
    locale,
  );

  const title = event.title[contentLocale];
  const description = event.description?.[contentLocale];

  const pageTitle = `${title} | ${agenda.title} | OpenAgenda`;
  const rootUrl = process.env.NEXT_PUBLIC_ROOT;
  const canonicalLocale = locale === 'io' ? 'en' : locale;
  const path = `/${agenda.slug}/events/${event.uid}_${event.slug}`;
  const canonicalUrl = `${rootUrl}/${canonicalLocale}${path}`;

  const languages: Record<string, string> = {};
  for (const key of SUPPORTED_LOCALES) {
    if (key === 'io') continue;
    languages[key] = `${rootUrl}/${key}${path}`;
  }
  languages['x-default'] = `${rootUrl}/en${path}`;

  const image = event.image
    ? `${IMAGE_PREFIX}${event.image.filename}`
    : undefined;

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
      locale: contentLocale,
      alternateLocale: SUPPORTED_LOCALES.filter(
        (l) => l !== contentLocale && l !== 'io',
      ),
      url: `${rootUrl}${path}`,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: 'summary',
      site: process.env.NEXT_PUBLIC_DOMAIN,
      title: pageTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { locale, agendaSlug, eventSlug } = await params;
  const sp = await searchParams;

  let agenda;
  try {
    agenda = await fetchAgenda(agendaSlug, { includeMemberSchema: true });
  } catch (e) {
    const { statusCode } = await parseApiError(e);
    if (statusCode === 401 || statusCode === 403 || statusCode === 404) {
      return (
        <EventError
          statusCode={statusCode}
          agendaSlug={agendaSlug}
          eventSlug={eventSlug}
        />
      );
    }
    await handleApiError(e);
  }

  let eventResponse;
  try {
    eventResponse = await fetchEvent(agendaSlug, eventSlug);
  } catch (e) {
    const { statusCode } = await parseApiError(e);
    if (statusCode === 401 || statusCode === 403 || statusCode === 404) {
      return (
        <EventError
          statusCode={statusCode}
          agendaSlug={agendaSlug}
          eventSlug={eventSlug}
          agenda={agenda}
        />
      );
    }
    await handleApiError(e);
  }

  const uidMatch = eventSlug.match(UID_SLUG_RE);
  if (eventResponse?.event) {
    const { event } = eventResponse;
    const canonicalSegment = `${event.uid}_${event.slug}`;
    if (canonicalSegment !== eventSlug || agenda.slug !== agendaSlug) {
      const search = qs.stringify(sp, { addQueryPrefix: true });
      permanentRedirect(
        `/${locale}/${agenda.slug}/events/${canonicalSegment}${search}`,
      );
    }
  }

  const eventFallbackKey = uidMatch
    ? `/api/agendas/slug/${agendaSlug}/events/${uidMatch[1]}?longDescriptionFormat=HTMLWithEmbeds`
    : `/api/agendas/slug/${agendaSlug}/events/slug/${eventSlug}?longDescriptionFormat=HTMLWithEmbeds`;

  return (
    <EventShowWrapper
      agenda={agenda}
      eventFallbackKey={eventFallbackKey}
      eventFallback={eventResponse}
    />
  );
}
