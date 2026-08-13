import injectResponsiveImage from '../src/images/injectResponsiveImage';

// Pure-function coverage for the opt-in `includeResponsiveImage` event composer,
// shared by the event-search read parser (indexed events) and the cibul-node core
// read paths (SQL drafts). Locks the per-field composition and, crucially, the
// Thumbor-off degrade path (callers run this whenever the flag is on, even with no
// CDN host — so it must still yield a usable legacy `src` rather than leaving a raw
// v2 descriptor).

const CDN = 'https://img.openagenda.com/';
const ASSET_BASE = 'https://cdn.openagenda.com/main/';
const OPTS = { imageCdnPath: CDN, bucket: 'main', assetBase: ASSET_BASE };

const eventDescriptor = {
  filename: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.base.image.jpg',
  base: ASSET_BASE,
  size: { width: 700, height: 394 },
  variants: [
    {
      type: 'full',
      filename: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.full.image.jpg',
      size: { width: 1400, height: 788 },
    },
  ],
};

describe('utils - injectResponsiveImage', () => {
  it('replaces an event image descriptor with the responsive Image shape', () => {
    const out = injectResponsiveImage(OPTS, { uid: 1, image: eventDescriptor });

    expect(out.image).toEqual({
      credits: null,
      width: 1400,
      height: 788,
      src: expect.stringContaining('/u/'),
      srcTemplate: expect.stringContaining('{geo}'),
      srcset: expect.any(Array),
    });
  });

  it('composes a full Image from a bare location.image source string', () => {
    const out = injectResponsiveImage(OPTS, {
      uid: 1,
      location: {
        name: 'x',
        image: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.full.image.jpg',
      },
    });

    expect(out.location.image.srcTemplate).toContain('{geo}');
    expect(out.location.image.src).toContain('/u/');
    expect(out.location.name).toBe('x');
  });

  it('composes lightweight ImageRefs for origin/source agenda logos', () => {
    const out = injectResponsiveImage(OPTS, {
      uid: 1,
      originAgenda: {
        uid: 7,
        image: 'cccccccccccccccccccccccccccccccc.full.image.jpg',
      },
      sourceAgendas: [
        { uid: 8, image: 'dddddddddddddddddddddddddddddddd.full.image.jpg' },
      ],
    });

    expect(out.originAgenda.image).toEqual({
      src: expect.stringContaining('/u/'),
      srcTemplate: expect.stringContaining('{geo}'),
    });
    expect(out.sourceAgendas[0].image.srcTemplate).toContain('{geo}');
  });

  it('degrades to a legacy CDN src when Thumbor is unconfigured (no imageCdnPath)', () => {
    const out = injectResponsiveImage(
      { assetBase: ASSET_BASE },
      { uid: 1, image: eventDescriptor },
    );

    expect(out.image.srcTemplate).toBeNull();
    expect(out.image.srcset).toEqual([]);
    expect(out.image.src).toBe(`${ASSET_BASE}${eventDescriptor.filename}`);
  });

  it('leaves the original value untouched when a source does not resolve', () => {
    const event = {
      uid: 1,
      location: { image: '' },
      originAgenda: { uid: 7, image: '' },
    };
    const out = injectResponsiveImage(OPTS, event);

    expect(out.location.image).toBe('');
    expect(out.originAgenda.image).toBe('');
  });

  it('ignores a non-string location/logo image', () => {
    const event = { uid: 1, location: { image: { already: 'object' } } };
    const out = injectResponsiveImage(OPTS, event);

    expect(out.location.image).toEqual({ already: 'object' });
  });
});
