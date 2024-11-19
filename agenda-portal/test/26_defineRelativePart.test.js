import defineRelativePart, {
  appendPreToNav,
} from '../client/lib/defineRelativePart.js';

describe('26 - defineRelativePart', () => {
  test('hash values are loaded in relative part when set', () => {
    const relative = defineRelativePart(
      {},
      '/events/english-surf-camp-6251855?nc=eyJpbmRleCI6MSwidG90YWwiOjQ5NzV9',
    );

    expect(relative).toBe(
      '/events/english-surf-camp-6251855?nc=eyJpbmRleCI6MSwidG90YWwiOjQ5NzV9',
    );
  });

  test('data-count attribute defines limit if data-random-from-set is not set', () => {
    const relative = defineRelativePart({
      count: '3',
    });

    expect(relative).toBe('?limit=3');
  });

  test('data-count defines subsetRandom and data-random-from-set limit if both are set', () => {
    const relative = defineRelativePart({
      count: '3',
      randomFromSet: '20',
    });

    expect(relative).toBe('?subsetRandom=3&limit=20');
  });

  test('data-lang adds lang to relative part', () => {
    const relative = defineRelativePart({
      lang: 'de',
    });

    expect(relative).toBe('?lang=de');
  });

  test('some random unrelated value is loaded in hash', () => {
    const relative = defineRelativePart(
      {
        lang: 'fr',
      },
      'unrelatedvalue',
    );

    expect(relative).toBe('?lang=fr');
  });

  test('another page of list is loaded in hash', () => {
    const relative = defineRelativePart(
      {
        lang: 'fr',
      },
      '/p/2',
    );

    expect(relative).toBe('/p/2?lang=fr');
  });

  describe('appendPreToNav', () => {
    test('does as it is named when pre exists', () => {
      expect(appendPreToNav('/p/3?lang=fr', 'keyword%5B0%5D=théâtre')).toBe(
        '/p/3?lang=fr&pre%5Bkeyword%5D%5B0%5D=th%C3%A9%C3%A2tre',
      );
    });

    test('does nothing if there is no pre', () => {
      expect(appendPreToNav('/p/3?lang=fr')).toBe('/p/3?lang=fr');
    });

    test('appends to empty path', () => {
      expect(appendPreToNav('', 'lang=fr')).toBe('?pre%5Blang%5D=fr');
    });
  });
});
