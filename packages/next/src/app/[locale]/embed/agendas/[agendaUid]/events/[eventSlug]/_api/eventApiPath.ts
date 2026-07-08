import qs from 'qs';
import parseEventUid from '@/src/utils/parseEventUid';

// Embed event URLs are addressed as `<uid>_<slug>` (e.g. from the prev/next
// navigation), but the `events/slug/<segment>` endpoint only matches a bare
// slug, so a `<uid>_<slug>` segment 404s there. Resolve by uid when the segment
// carries one (mirrors the public event route in
// (app)/[agendaSlug]/events/[eventSlug]), else fall back to slug.
export function embedEventApiPath(
  agendaUid: string,
  eventSlug: string,
): string {
  const uid = parseEventUid(eventSlug);
  return uid
    ? `api/agendas/${agendaUid}/events/${uid}`
    : `api/agendas/${agendaUid}/events/slug/${eventSlug}`;
}

export function buildEmbedEventSearch(referrer?: string | null): string {
  return qs.stringify({
    longDescriptionFormat: 'HTMLWithEmbeds',
    cms: 'embed',
    host: referrer || undefined,
  });
}

export function buildEventFallbackKey(
  agendaUid: string,
  eventSlug: string,
  referrer?: string | null,
): string {
  // Must match the URL `useEvent` builds on the client so SWR hydrates from
  // the pre-fetched fallback instead of re-fetching.
  return `/${embedEventApiPath(agendaUid, eventSlug)}?${buildEmbedEventSearch(
    referrer,
  )}`;
}
