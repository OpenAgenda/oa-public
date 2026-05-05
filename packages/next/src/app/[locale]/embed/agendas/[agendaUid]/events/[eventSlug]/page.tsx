import type { Metadata } from 'next';
import { headers } from 'next/headers';
import getLocale from '@/src/utils/getLocale';
import { errorToJSON } from '@/src/utils/errorToJSON';
import kyErrorToVError from '@/src/utils/kyErrorToVError';
import { logError } from '@/src/utils/sentry';
import { AgendaProvider } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_context/agenda';
import { fetchEmbedAgenda } from '../../_api';
import { buildEventFallbackKey, fetchEmbedEvent } from './_api';
import EmbedEventShowClient from './_components/EmbedEventShowClient';
import EmbedEventError from './_components/EmbedEventError';

type Params = Promise<{
  locale: string;
  agendaUid: string;
  eventSlug: string;
}>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { agendaUid, eventSlug } = await params;
  try {
    const [agenda, eventResponse] = await Promise.all([
      fetchEmbedAgenda(agendaUid),
      fetchEmbedEvent(agendaUid, eventSlug),
    ]);
    const locale = await getLocale();
    const title =
      eventResponse?.event?.title?.[locale] ??
      eventResponse?.event?.title?.en ??
      '';
    return {
      title: title
        ? `${title} | ${agenda.title} | OpenAgenda Embed`
        : `${agenda.title} | OpenAgenda Embed`,
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: 'OpenAgenda Embed',
      robots: { index: false, follow: false },
    };
  }
}

export default async function EmbedEventPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { agendaUid, eventSlug } = await params;
  const sp = await searchParams;
  const headersList = await headers();

  const hostFromQuery = Array.isArray(sp.host) ? sp.host[0] : sp.host;
  const referrer = hostFromQuery || headersList.get('referer') || null;

  let agenda;
  try {
    agenda = await fetchEmbedAgenda(agendaUid);
  } catch (e) {
    const error = await kyErrorToVError(e);
    const statusCode = error.statusCode ?? 500;
    if (statusCode !== 401 && statusCode !== 403 && statusCode !== 404) {
      logError(error);
    }
    return (
      <EmbedEventError statusCode={statusCode} error={errorToJSON(error)} />
    );
  }

  let eventResponse;
  try {
    eventResponse = await fetchEmbedEvent(agendaUid, eventSlug, { referrer });
  } catch (e) {
    const error = await kyErrorToVError(e);
    const statusCode = error.statusCode ?? 500;
    if (statusCode !== 401 && statusCode !== 403 && statusCode !== 404) {
      logError(error);
    }
    // EmbedEventError reads `useAgenda()` for the 404 branch so wrap in
    // AgendaProvider when the agenda was successfully fetched.
    return (
      <AgendaProvider agenda={agenda}>
        <EmbedEventError statusCode={statusCode} error={errorToJSON(error)} />
      </AgendaProvider>
    );
  }

  const fallbackKey = buildEventFallbackKey(
    String(agenda.uid),
    eventSlug,
    referrer,
  );

  return (
    <EmbedEventShowClient
      agenda={agenda}
      fallbackKey={fallbackKey}
      fallbackEvent={eventResponse}
      referrer={referrer}
    />
  );
}
