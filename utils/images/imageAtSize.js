// Render an agenda/location/event image at a given Thumbor geometry by swapping
// the source suffix for a geometry alias. The stored source is
// `{uuid}.full.image.jpg`; nginx rewrites the `.{geo}.image.jpg` alias to a
// Thumbor transform (behind KeyCDN at img.openagenda.com). See
// docs/design-thumbor-on-demand-images.md.
//
// Accepts a bare filename OR a full URL, preserves a `?…` cache-buster, and
// returns non-normalized/legacy refs unchanged (those were already served
// as-is). `geo` is a Thumbor geometry token, e.g. `100x100s` (smart-crop),
// `300x0` / `600x0` (proportional width).
//
// Idempotent across geometries: a source (`.full.image.jpg`) OR an
// already-sized alias (`.300x0.image.jpg`, `.200x200s.image.jpg`) is re-aliased
// to `geo`. This matters because the serving layer stamps a display geometry on
// the stored source (e.g. an agenda logo served at `.300x0.`), and a downstream
// consumer (a mail template) then re-sizes that value to its own geometry — the
// swap must catch the already-applied alias, not just the raw source, or the
// second resize silently no-ops and serves the wrong dimensions.
const SIZED_SUFFIX = /\.(?:full|\d+x\d+[sf]?)\.image\.jpg$/i;
export default function imageAtSize(ref, geo) {
  if (typeof ref !== 'string' || !ref) return ref;
  const [path, query] = ref.split('?');
  if (!SIZED_SUFFIX.test(path)) return ref; // legacy / not normalized
  const aliased = path.replace(SIZED_SUFFIX, `.${geo}.image.jpg`);
  return query ? `${aliased}?${query}` : aliased;
}
