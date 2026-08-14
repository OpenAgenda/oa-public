// Build the v3 responsive image object from a stored SOURCE descriptor.
//
// See docs/design-thumbor-on-demand-images.md. v3 serves images through Thumbor
// NATIVELY: it composes `{imageCdnPath}/u/{geo}/{bucket}/{uuid}.full.image.jpg`
// from CONFIG at the boundary — not from `image.base` (frozen at index time) nor
// via the v2 nginx name-rewrite. `imageCdnPath` is the CDN host (img.openagenda.com
// behind KeyCDN); `bucket` is the Thumbor loader segment (`config.s3.bucket`,
// `main`/`dev`) — the SAME segment the Next app emits, so both warm one cache.
//
// The shape is the clean v3 `Image`: { credits, width, height, src, srcTemplate,
// srcset } — no v2 internals (filename/base/variants). `src` is a ready-to-use
// default rendition (a naive <img src> just works); `srcTemplate`/`srcset` drive
// the responsive picture. Pure + side-effect-free (no I/O).
//
// Fallback: with no `imageCdnPath` (Thumbor not live) or no resolvable source,
// `src` falls back to the legacy `base + filename` URL (what works today) and the
// responsive set is empty — the naive path always works, the responsive one turns
// on with Thumbor. No LQIP: a useful placeholder is a base64-inlined blur stored
// at upload, not a URL.
//
// Lives in @openagenda/utils (not cibul-node) so BOTH the v3 API mappers AND the
// event-search read parsers can compose Thumbor URLs from the one shared source
// of truth. Le paquet est en ESM pur, publié tel quel sans build.

// A stored filename may carry a `?_ts=` cache-buster — strip it for the S3 key.
const keyOf = (name) => String(name).split('?')[0];

// An already-absolute image value. Embedded agenda refs snapshot the full CDN
// URL at index time (`https://cdn…/dev/agenda{uid}.jpg?__ts=…`), and legacy
// agenda/location rows may still hold an external URL. Such a value is ALREADY
// servable and must NOT be re-based — `base + url` would yield a broken double
// URL (and drop the cache-buster).
const ABSOLUTE = /^(?:https?:)?\/\//i;

// The canonical source form Thumbor derives geometries from. A descriptor only
// yields responsive URLs when its source resolves to this exact suffix — anything
// else (a default logo `graylogo140.png`, an un-normalized legacy or `evf…`
// variant) has no on-demand source and MUST NOT advertise URLs Thumbor can't
// serve. Same suffix `@openagenda/utils/imageAtSize` gates on, so the read shape
// and the serving swap agree on what "a source" is.
const SOURCE_SUFFIX = /\.full\.image\.jpg$/i;

const fullVariant = (descriptor) =>
  (Array.isArray(descriptor?.variants) ? descriptor.variants : []).find(
    (v) => v?.type === 'full',
  );

// The canonical source key `{uuid}.full.image.jpg` for a descriptor:
//   - prefer the `full` variant's filename (it IS the source),
//   - else swap a `{uuid}.base.image.jpg` top-level filename to `.full.`.
// Returns null unless the result is a real source (SOURCE_SUFFIX) — a lenient
// pass-through would hand back a non-source filename and build dead Thumbor URLs.
function sourceKeyOf(descriptor) {
  if (!descriptor || typeof descriptor !== 'object') return null;
  const full = fullVariant(descriptor);
  const topLevel = descriptor.filename ? keyOf(descriptor.filename) : null;
  const fromTopLevel = topLevel
    ? topLevel.replace(/\.base\.image\.jpg$/i, '.full.image.jpg')
    : null;
  const candidate = full?.filename ? keyOf(full.filename) : fromTopLevel;
  return candidate && SOURCE_SUFFIX.test(candidate) ? candidate : null;
}

// `https://img…/` + `700x0` + `dev` + `{uuid}.full.image.jpg`
//   -> `https://img…/u/700x0/dev/{uuid}.full.image.jpg`
// The `/u/` unsafe prefix + `{bucket}` loader segment match the prod Thumbor
// scheme (and the Next app's thumborLoader).
function thumborUrl(cdnBase, geo, bucket, sourceKey) {
  const root = String(cdnBase).replace(/\/+$/, '');
  return `${root}/u/${geo}/${bucket}/${sourceKey}`;
}

// Proportional-width ladder, aligned on Next's `deviceSizes` (the OA front already
// requests these via its Thumbor loader → shared CDN cache). Widths wider than the
// intrinsic source are dropped (never upscale); the source width is offered as the
// sharp cap. `src` default is a mid ladder stop (also a Next stop → warm render).
const DEFAULT_WIDTHS = [640, 828, 1080, 1200, 1920];
const DEFAULT_SRC_WIDTH = 1080;

// The clean v3 Image object. Keys are ALWAYS present (contract:
// additionalProperties:false, every field emitted). Returns null only for a
// non-image descriptor (caller coerces the field to null).
function responsiveImage(
  descriptor,
  {
    imageCdnPath,
    bucket,
    widths = DEFAULT_WIDTHS,
    srcWidth = DEFAULT_SRC_WIDTH,
  } = {},
) {
  if (!descriptor || typeof descriptor !== 'object') return null;

  const full = fullVariant(descriptor);
  // Intrinsic size is the `full` variant's (it IS the source). A full variant
  // that EXISTS but carries no size means UNKNOWN — do NOT fall back to the
  // event's base (700px) top-level `descriptor.size`, which would cap the ladder
  // at 700 for a genuinely large image (an on-demand upload whose gm size probe
  // was missing produces exactly this shape). Only a variant-less descriptor
  // (agenda/location from-source) reads the top-level size.
  const size = (full ? full.size : descriptor.size) || {};
  const width = Number.isFinite(size.width) ? size.width : null;
  const height = Number.isFinite(size.height) ? size.height : null;
  const credits = descriptor.credits ?? null;

  // Thumbor needs BOTH a host and a loader bucket; without the bucket the URL
  // would carry a literal `undefined` segment, so treat a missing bucket as
  // "Thumbor off" and fall back rather than emit a dead URL.
  const sourceKey = imageCdnPath && bucket ? sourceKeyOf(descriptor) : null;

  // No Thumbor host/bucket, or no resolvable source → legacy fallback for `src`.
  if (!sourceKey) {
    const name = descriptor.filename;
    let legacy = null;
    if (name && ABSOLUTE.test(name)) {
      // Already a full URL — serve it as-is (keep the cache-buster).
      legacy = name;
    } else if (name && descriptor.base) {
      // A bare stored name is joined to its `base`.
      legacy = `${descriptor.base}${keyOf(name)}`;
    }
    return {
      credits,
      width,
      height,
      src: legacy,
      srcTemplate: null,
      srcset: [],
    };
  }

  const url = (geo) => thumborUrl(imageCdnPath, geo, bucket, sourceKey);

  // A known intrinsic width caps the ladder (never upscale) and is offered as the
  // sharp width; an unknown/zero width can't be filtered, so offer the ladder as
  // is. `> 0` (not truthy) so a stray 0 falls to the unknown branch, not `[0]`.
  const capped = width > 0 ? width : null;
  const candidates = capped
    ? widths.filter((w) => w < capped).concat(capped)
    : widths;
  const srcset = [...new Set(candidates)]
    .sort((a, b) => a - b)
    .map((w) => ({ width: w, url: url(`${w}x0`) }));

  // `src` default width, capped at the source (never upscale).
  const srcW = capped ? Math.min(srcWidth, capped) : srcWidth;

  return {
    credits,
    width,
    height,
    src: url(`${srcW}x0`),
    // Documented template: substitute `{geo}` (e.g. `800x0`, `300x300`).
    srcTemplate: url('{geo}'),
    srcset,
  };
}

// Agendas/locations store a BARE source string (`{uuid}.full.image.jpg` after
// migration, or a legacy name), not an event's `{filename, base, variants}`
// descriptor. Wrap it so the same builder applies: `assetBase` (config.s3
// mainBucketPath) is the legacy fallback root when Thumbor is off. Intrinsic
// size is unknown for these (no stored dimensions) → width/height null, srcset
// offers the full ladder. Returns null for an empty/non-string source.
//
// The caller MUST hand this the raw source, not a display-sized alias: v3 reads
// pass `includeImagePath:false` so the agenda service (and the search index's
// `cleanIndexedAgenda`) yield the bare `.full` source rather than a prefixed,
// display-sized (`.300x0.`) URL — the responsive builder derives every geometry
// from `.full` itself.
function responsiveImageFromSource(source, imageOptions = {}) {
  if (!source || typeof source !== 'string') return null;
  return responsiveImage(
    { filename: source, base: imageOptions.assetBase },
    imageOptions,
  );
}

// A ref (an agenda logo embedded in an event's originAgenda/sourceAgendas, or a
// provenance facet bucket) needs only a displayable image, not the full
// responsive kit: its source is a BARE string with no indexed dimensions, so a
// full Image would carry a null width/height and an uncapped srcset — a
// look-alike with hollow fields. We emit the lightweight ImageRef
// { src, srcTemplate } instead: a ready `src` at a modest proportional width for
// the 90% naive `<img>` case, plus the `{geo}` template as a re-render escape
// hatch (retina, a different layout size). A client that wants the real
// responsive Image (with dims) follows the ref to its agenda endpoint. Same
// fallback as the full builder: `src` is the legacy URL (srcTemplate null) when
// Thumbor is off or the source doesn't resolve. Returns null for an empty
// source. See docs/design-thumbor-on-demand-images.md.
const DEFAULT_REF_WIDTH = 400;

function imageRefFromSource(source, imageOptions = {}) {
  const image = responsiveImageFromSource(source, {
    ...imageOptions,
    srcWidth: DEFAULT_REF_WIDTH,
  });
  return image && { src: image.src, srcTemplate: image.srcTemplate };
}

// A single ready-to-load image URL at one Thumbor `geo`, for SERVER-RENDERED
// consumers that emit ONE `<img src>` — share mails, the SSR error layout,
// internal JSON (`/agenda.json`), inbox avatars. These have NO legacy client
// contract (nobody parses the URL), so unlike the v2 API JSON they skip the nginx
// name-rewrite shim and address Thumbor NATIVELY (`/u/{geo}/{bucket}/{source}`),
// composed from config — one fewer moving part, and the same CDN cache the front
// warms. `geo` is a Thumbor geometry token: proportional `700x0` / `400x0`, or a
// plain (center-crop) square `100x100`. We do NOT emit `/smart/` crops by default
// — focal-point detection is unpredictable on posters/logos and adds a detector
// dependency; center crop matches the legacy `.thumb` (gravity Center) behavior.
//
// Accepts a BARE source string (agenda/location/user image) or an event
// `{filename, base, variants}` descriptor. Degrades to the legacy CDN URL that
// works today (`assetBase + name`) when Thumbor is off or the value isn't an
// on-demand `.full` source — so it's a no-op until Thumbor is live AND the image
// is migrated (un-migrated avatars keep serving from the plain CDN). Absolute
// values (external/legacy full URLs) pass through untouched. Returns null for an
// empty value.
function nativeImageUrl(value, geo, { imageCdnPath, bucket, assetBase } = {}) {
  if (!value) return null;

  // Event descriptor: resolve its canonical `.full` source, else the legacy base.
  if (typeof value === 'object') {
    const key = imageCdnPath && bucket ? sourceKeyOf(value) : null;
    if (key) return thumborUrl(imageCdnPath, geo, bucket, key);
    const name = value.filename;
    if (!name) return null;
    if (ABSOLUTE.test(name)) return name;
    // `||`, not `??`: an empty `base` is not a serving root, it is the absence
    // of one. A descriptor built on an unset root carries `''`, and falling
    // through to `assetBase` is what lets the field store address the object —
    // `??` would keep the empty string and return null, an empty frame for a
    // file that is stored and perfectly addressable.
    const base = value.base || assetBase;
    // Keep the `?_ts=` cache-buster on the legacy URL (like the string branch
    // below and the `mainBucketPath + filename` this replaced) — it busts the
    // CDN cache on re-upload.
    return base ? `${base}${name}` : null;
  }

  if (typeof value !== 'string') return null;
  if (ABSOLUTE.test(value)) return value;
  const key = keyOf(value);
  if (imageCdnPath && bucket && SOURCE_SUFFIX.test(key)) {
    return thumborUrl(imageCdnPath, geo, bucket, key);
  }
  // Keep the `?_ts=` cache-buster on the legacy URL (today's behavior).
  return assetBase ? `${assetBase}${value}` : null;
}

// A "served" image string as the v2 read layer returns it: a bare source
// (`{uuid}.full.image.jpg`), a serving-root-prefixed URL
// (`{root}/{uuid}.full.image.jpg`), or a legacy ABSOLUTE external URL. Recover the
// bare source (last path segment) the builder derives geometries from — a real
// Thumbor source survives as that bare `.full.image.jpg` name whether or not it was
// prefixed. But if the last segment is NOT a source AND the value was ABSOLUTE, it
// is an external/legacy URL that is already servable and must pass STRAIGHT THROUGH:
// splitting it to a segment and re-basing onto `assetBase` was the aliased-URL bug.
// Returns `{ absolute }` (pass through) or `{ source }` (compose), or null for a
// non-string/empty value.
function servedSource(value) {
  if (!value || typeof value !== 'string') return null;
  const segment = value.split('/').pop();
  if (!SOURCE_SUFFIX.test(keyOf(segment)) && ABSOLUTE.test(value)) {
    return { absolute: value };
  }
  return { source: segment };
}

// Full responsive Image from a SERVED image string (see servedSource). Absolute
// values pass through as a ready `src` with no responsive template (can't Thumbor
// an external URL); everything else composes via responsiveImageFromSource.
function responsiveImageFromServed(value, imageOptions = {}) {
  const parsed = servedSource(value);
  if (!parsed) return null;
  if (parsed.absolute) {
    return {
      credits: null,
      width: null,
      height: null,
      src: parsed.absolute,
      srcTemplate: null,
      srcset: [],
    };
  }
  return responsiveImageFromSource(parsed.source, imageOptions);
}

// Lightweight ImageRef ({ src, srcTemplate }) from a SERVED image string. Same
// absolute-passthrough rule as responsiveImageFromServed.
function imageRefFromServed(value, imageOptions = {}) {
  const parsed = servedSource(value);
  if (!parsed) return null;
  if (parsed.absolute) return { src: parsed.absolute, srcTemplate: null };
  return imageRefFromSource(parsed.source, imageOptions);
}

// Shape the `config.s3` block into the option object every composer takes
// ({ imageCdnPath, bucket, assetBase }). The ONE place that maps s3 field names
// onto the builder's inputs, shared by the v3 mappers, the event-search parser
// and the v2 core read paths so they never drift.
//
// assetBase is the on-demand serving path (`imageServingPath`, `img…/main/`), NOT
// the plain-CDN root (`mainBucketPath`, `cdn…/main/`). assetBase is ONLY the legacy
// DEGRADE root — the fallback for a name with no resolvable `.full.image.jpg`
// source; real (migrated) images compose a Thumbor template and never read it.
// Using imageServingPath keeps ONE host across every read path — search, SQL and
// draft — and matches the `base` the events service stamps at index time, so a
// single image never double-caches under two hosts. Safe because img.openagenda.com
// passes any stored `main//dev/` object straight to the loader (prod nginx
// `location ~* (main|dev)/….(jpe?g|png|gif|webp|avif)$` → `/unsafe/…`). Caveat: that
// passthrough list excludes `.svg`, so a legacy SVG degrade 404s on img where it
// served on the plain CDN — accepted (SVG through the responsive/Thumbor path is
// already unsupported). See docs/design-thumbor-on-demand-images.md.
function imageServingOptions(s3 = {}) {
  return {
    imageCdnPath: s3.imageCdnPath,
    bucket: s3.bucket,
    assetBase: s3.imageServingPath,
  };
}

// L'export par défaut reste le composeur d'Image complète ; les aides sont des
// exports nommés, que le baril `./images` réexporte.
export default responsiveImage;

export {
  sourceKeyOf,
  thumborUrl,
  responsiveImage,
  responsiveImageFromSource,
  responsiveImageFromServed,
  imageRefFromSource,
  imageRefFromServed,
  nativeImageUrl,
  imageServingOptions,
  DEFAULT_WIDTHS,
  DEFAULT_SRC_WIDTH,
  DEFAULT_REF_WIDTH,
};
