import { storedImageRef } from '../images/index.js';

const UUID = 'cd8687bff5ab4212abac03a4707b80d8';

describe('utils - storedImageRef', () => {
  it('names an event descriptor by its file, without the cache-buster', () => {
    expect(
      storedImageRef({
        filename: `${UUID}.base.image.jpg?_ts=1790168882382`,
        base: 'https://img.openagenda.com/dev/',
        variants: [
          {
            type: 'full',
            filename: `${UUID}.full.image.jpg?_ts=1790168882382`,
          },
        ],
      }),
    ).toBe(`${UUID}.base.image.jpg`);
  });

  it('names a bare stored string the same way', () => {
    expect(storedImageRef(`${UUID}.jpg?_ts=1790168882382`)).toBe(`${UUID}.jpg`);
  });

  it('names a prefixed string by its last segment', () => {
    expect(
      storedImageRef(
        `https://img.openagenda.com/main/${UUID}.full.image.jpg?_ts=1`,
      ),
    ).toBe(`${UUID}.full.image.jpg`);
    expect(
      storedImageRef('https://img.openagenda.com/main/location42.jpg?_ts=1'),
    ).toBe('location42.jpg');
  });

  it('names an image the same whether its string is prefixed or not', () => {
    const stored = 'location42.600x0.image.jpg?_ts=1';
    expect(storedImageRef(`https://img.openagenda.com/main/${stored}`)).toBe(
      storedImageRef(stored),
    );
  });

  it('takes the last segment of the path, not of the query', () => {
    expect(storedImageRef('https://example.com/a/photo.jpg?sig=ab/cd')).toBe(
      'photo.jpg',
    );
  });

  it('is null without a stored image', () => {
    expect(storedImageRef(null)).toBeNull();
    expect(storedImageRef('')).toBeNull();
    expect(storedImageRef({ credits: null })).toBeNull();
  });
});
