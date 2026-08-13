import responsiveImage, {
  imageRefFromSource,
  responsiveImageFromSource,
  type ImageDescriptor,
  type ImageOptions,
} from './responsiveImage.js';

interface WithImage {
  image?: unknown;
}

// La forme minimale que ce composeur touche. Tout le reste de l'événement est
// recopié tel quel, d'où l'index signature.
export interface EventWithImages extends WithImage {
  location?: WithImage;
  originAgenda?: WithImage;
  sourceAgendas?: WithImage[];
  [key: string]: unknown;
}

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
//   - `event.location.image` (bare source string) -> full Image (dims unknown)
//   - embedded agenda logos (`originAgenda`/`sourceAgendas[].image`, bare
//     strings) -> lightweight ImageRef {src,srcTemplate}
//
// Immutable: returns a new event; a null result (no resolvable source) leaves the
// original value untouched so nothing regresses.
export default function injectResponsiveImage<T extends EventWithImages>(
  imageOptions: ImageOptions,
  event: T,
): T {
  const next: EventWithImages = { ...event };

  if (event.image && typeof event.image === 'object') {
    const image = responsiveImage(event.image as ImageDescriptor, imageOptions);
    if (image) next.image = image;
  }

  if (typeof event.location?.image === 'string') {
    const image = responsiveImageFromSource(event.location.image, imageOptions);
    if (image) next.location = { ...event.location, image };
  }

  if (typeof event.originAgenda?.image === 'string') {
    const ref = imageRefFromSource(event.originAgenda.image, imageOptions);
    if (ref) next.originAgenda = { ...event.originAgenda, image: ref };
  }

  if (Array.isArray(event.sourceAgendas)) {
    next.sourceAgendas = event.sourceAgendas.map((sourceAgenda) => {
      if (typeof sourceAgenda?.image !== 'string') return sourceAgenda;
      const ref = imageRefFromSource(sourceAgenda.image, imageOptions);
      return ref ? { ...sourceAgenda, image: ref } : sourceAgenda;
    });
  }

  return next as T;
}
