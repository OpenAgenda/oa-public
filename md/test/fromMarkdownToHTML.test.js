import fs from 'node:fs/promises';
import * as url from 'node:url';
import { fromMarkdownToHTML } from '../src/index.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const withSubtitleMarkdown = await fs.readFile(
  `${__dirname}/fixtures/withSubtitle.md`,
  'utf-8',
);
const withSubtitleHTML = await fs.readFile(
  `${__dirname}/fixtures/withSubtitle.html`,
  'utf-8',
);

describe('fromMarkdownToHTML', () => {
  test('from can handle nothingness', () => {
    expect(fromMarkdownToHTML()).toBe('');
  });

  test('basic', () => {
    expect(fromMarkdownToHTML('Yeay\n====')).toBe('<h1>Yeay</h1>\n');
  });

  test('href are maintained in links', () => {
    expect(fromMarkdownToHTML('Here is a link: [Kaoré](https://kao.re)')).toBe(
      '<p>Here is a link: <a href="https://kao.re">Kaoré</a></p>\n',
    );
  });

  test('A line break inserts a <br>', () => {
    const r = fromMarkdownToHTML(['Here is a line', 'Next line'].join('\n'));

    expect(r).toBe('<p>Here is a line<br>Next line</p>\n');
  });

  test('multiple links', () => {
    const r = fromMarkdownToHTML(
      [
        'Nothing worked. Here is a first one: [https://le_monde.fr](https://le_monde.fr)',
        'And the same [https://le_monde.fr](https://le_monde.fr)',
        '',
        '[https://le_monde.fr](https://le_monde.fr) and a [https://www.youtube.com/watch?v=io2d_cpoLDg](https://www.youtube.com/watch?v=io2d_cpoLDg) link and one with a [label](https://www.youtube.com/watch?v=io2d_cpoLDg)',
      ].join('\n'),
    );

    expect(r).toBe(
      [
        '<p>Nothing worked. Here is a first one: <a href="https://le_monde.fr">https://le_monde.fr</a><br>And the same <a href="https://le_monde.fr">https://le_monde.fr</a></p>',
        '<p></p>',
        '<p><a href="https://le_monde.fr">https://le_monde.fr</a> and a <a href="https://www.youtube.com/watch?v=io2d_cpoLDg">https://www.youtube.com/watch?v=io2d_cpoLDg</a> link and one with a <a href="https://www.youtube.com/watch?v=io2d_cpoLDg">label</a></p>',
        '',
      ].join('\n'),
    );
  });

  test('list', () => {
    const r = fromMarkdownToHTML(`A list

*   One
*   Two
*   Three
`);

    expect(r).toBe(`<p>A list</p>
<p></p>
<ul>
<li>One</li>
<li>Two</li>
<li>Three</li>
</ul>
`);
  });

  test('Subtitle', () => {
    expect(fromMarkdownToHTML(withSubtitleMarkdown)).toBe(withSubtitleHTML);
  });

  describe('selfDomain option', () => {
    test('same domain gives no target blank links', () => {
      expect(
        fromMarkdownToHTML(
          'Un site qui marche à peu près: [OpenAgenda](https://openagenda.com)',
          { selfDomain: 'https://openagenda.com' },
        ),
      ).toBe(
        '<p>Un site qui marche à peu près: <a href="https://openagenda.com">OpenAgenda</a></p>\n',
      );
    });

    test('different domain from self domain sees target attribute set in tag', () => {
      expect(
        fromMarkdownToHTML(
          'Un site qui marche à peu près: [OpenAgenda](https://openagenda.com)',
          { selfDomain: 'https://anothersite.com' },
        ),
      ).toBe(
        '<p>Un site qui marche à peu près: <a target="_blank" href="https://openagenda.com">OpenAgenda</a></p>\n',
      );
    });

    test('unset selfDomain option means no target attribute', () => {
      expect(
        fromMarkdownToHTML(
          'Un site qui marche à peu près: [OpenAgenda](https://openagenda.com)',
        ),
      ).toBe(
        '<p>Un site qui marche à peu près: <a href="https://openagenda.com">OpenAgenda</a></p>\n',
      );
    });
  });
});
