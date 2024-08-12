import extractLinksAsInMarkdown from '../src/utils/extractLinksAsInMarkdown.js';

describe('extractLinkAsInMarkdown', () => {
  test('non-escaped links', () => {
    const links = extractLinksAsInMarkdown(
      [
        'Nothing worked. Here is a first one: [https://le_monde.fr](https://le_monde.fr)',
        '[https://le_monde.fr](https://le_monde.fr) and a [https://www.youtube.com/watch?v=io2d_cpoLDg](https://www.youtube.com/watch?v=io2d_cpoLDg) link and one with a [label](https://www.youtube.com/watch?v=io2d_cpoLDg)',
      ].join('\n'),
    );

    expect(links).toEqual([
      'https://le_monde.fr',
      'https://le_monde.fr',
      'https://www.youtube.com/watch?v=io2d_cpoLDg',
      'https://www.youtube.com/watch?v=io2d_cpoLDg',
    ]);
  });

  test('escaped link', () => {
    const links = extractLinksAsInMarkdown(
      '[Un label](https://www.autrelien.com?c%5B%5D=v&dfa%5B%5D=discovery)',
    );

    expect(links).toEqual([
      'https://www.autrelien.com?c%5B%5D=v&dfa%5B%5D=discovery',
    ]);
  });

  test('escaped links', () => {
    const links = extractLinksAsInMarkdown(
      [
        '[Label](https://link.com) et [autre label](https://www.autrelien.com?c%5B%5D=v&dfa%5B%5D=discovery)',
        'ça devrait marcher correctement',
      ].join('\n'),
    );

    expect(links).toEqual([
      'https://link.com',
      'https://www.autrelien.com?c%5B%5D=v&dfa%5B%5D=discovery',
    ]);
  });

  test('escaped and unescaped links', () => {
    const links = extractLinksAsInMarkdown(
      '[Ici](https://www.autrelien.com?c%5B%5D=v&dfa%5B%5D=discovery) et [là](https://www.autrelien.com?c[]=v&dfa[]=discovery)',
    );
    expect(links).toEqual([
      'https://www.autrelien.com?c%5B%5D=v&dfa%5B%5D=discovery',
      'https://www.autrelien.com?c[]=v&dfa[]=discovery',
    ]);
  });
});
