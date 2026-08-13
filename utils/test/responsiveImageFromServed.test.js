import {
  responsiveImageFromServed,
  imageRefFromServed,
} from '../src/images/responsiveImage';

// Coverage for the "served image string" helpers shared by the v2 core read paths
// (agenda get/search, event references, user avatar). The load-bearing case is the
// ABSOLUTE legacy/external URL: it must pass straight through as a ready `src` and
// NEVER be split to a last segment + re-based onto the CDN (the aliased-URL bug).

const CDN = 'https://img.openagenda.com/';
const ASSET_BASE = 'https://cdn.openagenda.com/main/';
const OPTS = { imageCdnPath: CDN, bucket: 'main', assetBase: ASSET_BASE };

const SOURCE = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.full.image.jpg';

describe('utils - responsiveImageFromServed / imageRefFromServed', () => {
  it('composes responsive URLs from a bare .full source', () => {
    const out = responsiveImageFromServed(SOURCE, OPTS);
    expect(out.src).toContain('/u/');
    expect(out.src).toContain(`/main/${SOURCE}`);
    expect(out.srcTemplate).toContain('{geo}');
  });

  it('recovers the bare source from a serving-root-prefixed URL', () => {
    const out = responsiveImageFromServed(`${ASSET_BASE}${SOURCE}`, OPTS);
    // The prefix is stripped and the bucket comes from opts, not the URL path.
    expect(out.srcTemplate).toBe(`${CDN}u/{geo}/main/${SOURCE}`);
  });

  it('passes an ABSOLUTE external URL through untouched (no split + re-base)', () => {
    const external = 'https://lh3.googleusercontent.com/a/user-avatar=s96';
    const out = responsiveImageFromServed(external, OPTS);
    expect(out.src).toBe(external);
    expect(out.srcTemplate).toBeNull();
    expect(out.srcset).toEqual([]);
  });

  it('imageRefFromServed passes an ABSOLUTE URL through as a ready src', () => {
    const external = 'https://cdn.example.com/dev/agenda42.jpg?__ts=1';
    const ref = imageRefFromServed(external, OPTS);
    expect(ref).toEqual({ src: external, srcTemplate: null });
  });

  it('imageRefFromServed composes a lightweight ref from a bare source', () => {
    const ref = imageRefFromServed(SOURCE, OPTS);
    expect(ref.srcTemplate).toContain('{geo}');
    expect(Object.keys(ref).sort()).toEqual(['src', 'srcTemplate']);
  });

  it('returns null for an empty or non-string value', () => {
    expect(responsiveImageFromServed('', OPTS)).toBeNull();
    expect(responsiveImageFromServed(null, OPTS)).toBeNull();
    expect(responsiveImageFromServed({ already: 'object' }, OPTS)).toBeNull();
    expect(imageRefFromServed(undefined, OPTS)).toBeNull();
  });
});
