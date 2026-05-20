// Event URLs use a `<uid>_<slug>` shape so they stay stable when an event's
// slug changes. The parser also accepts a bare `<uid>` and a trailing
// underscore so legacy/short links keep resolving — the canonical redirect
// rewrites them to the full shape on the next render.
const UID_SLUG_RE = /^(\d+)(?:_.*)?$/;

export default function parseEventUid(
  eventSlug: string | undefined,
): string | null {
  const m = eventSlug?.match(UID_SLUG_RE);
  return m ? m[1] : null;
}
