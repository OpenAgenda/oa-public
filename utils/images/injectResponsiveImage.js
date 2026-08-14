import {
  responsiveImage,
  responsiveImageFromServed,
  imageRefFromServed,
} from './responsiveImage.js';

// The `…FromServed` variants, like every other read path: what reaches this
// function is whatever the value was when the event was indexed, and that is
// sometimes a serving-root-prefixed URL rather than a bare source (a `agendas.get`
// with `includeImagePath` on — see services/agendaEvents/lib/fallbackContextGet).
// `…FromSource` takes the whole URL for the source key, because it ends in
// `.full.image.jpg`, and composes `{cdn}/u/{geo}/{bucket}/https://…` — a 404.

// Opt-in (includeResponsiveImage): replace the stored v2 image shapes on an event
// with ready-to-use v3 responsive images, composed server-side from config
// (imageCdnPath + bucket) + the canonical `.full` source. The front then renders
// `image.src`/`srcset` directly instead of hand-building `${bucket}/${filename}`
// + a Thumbor loader (which couples it to the bucket, the CDN prefix, and the
// name suffix — the source of the aliased-URL 404s).
//
// Shared by BOTH the event-search read parser (indexed events) AND the cibul-node
// core read paths that serve events from SQL (drafts), so every event read — no
// matter the source — composes images the same way. Same builder the v3 API
// mappers use, so v2-enriched and v3 reads agree on the shape.
//
//   - `event.image` (descriptor {filename,base,variants,size}) -> full Image
//     {credits,width,height,src,srcTemplate,srcset}
//   - `event.location.image` (served string) -> full Image (dims unknown)
//   - embedded agenda logos (`originAgenda`/`sourceAgendas[].image`, served
//     strings) -> lightweight ImageRef {src,srcTemplate}
//
// "Served" and not "bare source": these are index snapshots, so the same field
// holds a bare source, a serving-root-prefixed URL or a legacy name depending on
// when the event was last indexed. `servedSource` absorbs all three.
//
// Immutable: returns a new event; a null result (no resolvable source) leaves the
// original value untouched so nothing regresses.
export default function injectResponsiveImage(imageOptions, event) {
  const next = { ...event };

  if (event.image && typeof event.image === 'object') {
    const image = responsiveImage(event.image, imageOptions);
    if (image) next.image = image;
  }

  if (typeof event.location?.image === 'string') {
    const image = responsiveImageFromServed(event.location.image, imageOptions);
    if (image) next.location = { ...event.location, image };
  }

  if (typeof event.originAgenda?.image === 'string') {
    const ref = imageRefFromServed(event.originAgenda.image, imageOptions);
    if (ref) next.originAgenda = { ...event.originAgenda, image: ref };
  }

  if (Array.isArray(event.sourceAgendas)) {
    next.sourceAgendas = event.sourceAgendas.map((sourceAgenda) => {
      if (typeof sourceAgenda?.image !== 'string') return sourceAgenda;
      const ref = imageRefFromServed(sourceAgenda.image, imageOptions);
      return ref ? { ...sourceAgenda, image: ref } : sourceAgenda;
    });
  }

  return next;
}
