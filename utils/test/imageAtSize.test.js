import imageAtSize from '../images/imageAtSize.js';

describe('utils - imageAtSize', () => {
  it('swaps the source suffix for a geometry alias on a full URL', () => {
    expect(
      imageAtSize('https://img.openagenda.com/abc.full.image.jpg', '100x100s'),
    ).toBe('https://img.openagenda.com/abc.100x100s.image.jpg');
  });

  it('works on a bare filename', () => {
    expect(imageAtSize('abc.full.image.jpg', '300x0')).toBe(
      'abc.300x0.image.jpg',
    );
  });

  it('re-sizes an already-aliased geometry (idempotent across geometries)', () => {
    // The serving layer stamps a display geometry on the source; a downstream
    // consumer must be able to re-size THAT value, not just the raw `.full.`.
    expect(
      imageAtSize('https://img.openagenda.com/abc.300x0.image.jpg', '100x100s'),
    ).toBe('https://img.openagenda.com/abc.100x100s.image.jpg');
    expect(imageAtSize('abc.200x200s.image.jpg', '100x100s')).toBe(
      'abc.100x100s.image.jpg',
    );
  });

  it('preserves a ?__ts cache-buster', () => {
    expect(
      imageAtSize(
        'https://img.openagenda.com/abc.full.image.jpg?__ts=42',
        '100x100s',
      ),
    ).toBe('https://img.openagenda.com/abc.100x100s.image.jpg?__ts=42');
  });

  it('returns non-normalized/legacy refs unchanged', () => {
    expect(
      imageAtSize('https://cdn.openagenda.com/agenda123.uuid.jpg', '100x100s'),
    ).toBe('https://cdn.openagenda.com/agenda123.uuid.jpg');
  });

  it('passes through non-strings (null/undefined)', () => {
    expect(imageAtSize(null, '100x100s')).toBeNull();
    expect(imageAtSize(undefined, '100x100s')).toBeUndefined();
  });
});
