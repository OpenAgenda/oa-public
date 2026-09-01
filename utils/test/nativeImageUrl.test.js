import { nativeImageUrl } from '../images/responsiveImage.js';

// The load-bearing case: a value that is ABSOLUTE and ours. The v2 read layer
// serves `{root}/{uuid}.full.image.jpg`, so every caller that handed such a value
// to `nativeImageUrl` used to get it back verbatim — the geometry it asked for
// silently dropped, and the full-size original served in its place. An absolute
// value that is NOT one of our sources is external and must still pass through.

const CDN = 'https://img.openagenda.com/';
const ASSET_BASE = 'https://cdn.openagenda.com/main/';
const OPTS = { imageCdnPath: CDN, bucket: 'main', assetBase: ASSET_BASE };

const NAME = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.full.image.jpg';

describe('utils - nativeImageUrl', () => {
  it('composes a Thumbor URL from a bare source', () => {
    expect(nativeImageUrl(NAME, '100x100', OPTS)).toBe(
      `${CDN}u/100x100/main/${NAME}`,
    );
  });

  it('applies the geometry to a served source, root and all', () => {
    expect(nativeImageUrl(`${ASSET_BASE}${NAME}`, '100x100', OPTS)).toBe(
      `${CDN}u/100x100/main/${NAME}`,
    );
  });

  it('composes from the bucket the value names, not the configured one', () => {
    // A value served from `dev` read by a `main`-configured process: the object
    // lives in `dev`, and rebuilding it onto `main` points at nothing.
    expect(
      nativeImageUrl(`https://cdn.openagenda.com/dev/${NAME}`, '100x100', OPTS),
    ).toBe(`${CDN}u/100x100/dev/${NAME}`);
  });

  it('falls back to the configured bucket when the value names none', () => {
    expect(
      nativeImageUrl(`https://cdn.openagenda.com/${NAME}`, '100x100', OPTS),
    ).toBe(`${CDN}u/100x100/main/${NAME}`);
  });

  it('passes an external absolute URL through untouched', () => {
    const external = 'https://example.org/some/logo.png';

    expect(nativeImageUrl(external, '100x100', OPTS)).toBe(external);
  });

  it('passes a legacy absolute name through untouched', () => {
    // Not a `.full.image.jpg` source: nothing to derive a geometry from.
    const legacy = `${ASSET_BASE}review_planning-intervenants_00.jpg`;

    expect(nativeImageUrl(legacy, '100x100', OPTS)).toBe(legacy);
  });

  it('keeps the value it was given when Thumbor is off', () => {
    // No CDN host configured: the source is still addressable on the plain
    // bucket, and the caller must not lose it.
    expect(
      nativeImageUrl(`${ASSET_BASE}${NAME}`, '100x100', {
        assetBase: ASSET_BASE,
      }),
    ).toBe(`${ASSET_BASE}${NAME}`);
  });

  it('passes an absolute URL through whatever its scheme', () => {
    // `lib/commons-app.js` hand-rolled this test and accepted `ftp://`; folding
    // it into this helper must not quietly narrow it, or such a row comes back
    // as `{root}/ftp://host/logo.jpg`.
    const ftp = 'ftp://host.example.org/logo.jpg';

    expect(nativeImageUrl(ftp, '100x100', OPTS)).toBe(ftp);
  });

  it('returns null for an empty value', () => {
    expect(nativeImageUrl(null, '100x100', OPTS)).toBeNull();
  });
});
