import { fromHTMLToMarkdown } from '../src/index.js';

describe('fromHTMLToMarkdown', () => {
  test('basic', () => {
    expect(
      fromHTMLToMarkdown('<h1>Yeay</h1>'),
    ).toBe('Yeay\n====');
  });

  test('with a link as paragraph', () => {
    const r = fromHTMLToMarkdown(`
      <p>Un lien en texte:</p>
      <p>https://le_monde.fr</p>
      <p>Un autre: https://le_monde.fr</p>
      <p>Puis un déjà en markdown: <a href="https://le_monde.fr">Le label</a></p>
    `);

    expect(r).toBe([
      'Un lien en texte:',
      '[https://le\\_monde.fr](https://le_monde.fr)',
      'Un autre: [https://le\\_monde.fr](https://le_monde.fr)',
      'Puis un déjà en markdown: [Le label](https://le_monde.fr)',
    ].join('\n'));
  });

  test('links with & are properly replaced', () => {
    const r = fromHTMLToMarkdown([
      '<p>Avant</p>',
      '<p>https://www.youtube.com/watch?v=5_8h_Pwy15s</p>',
      '<p></p>',
      '<p>https://www.youtube.com/watch?v=9f07_6MQ9sc&amp;feature=youtu.be</p>',
      '<p></p>',
      '<p>et après</p>',
    ].join(''));

    expect(r).toBe([
      'Avant',
      '[https://www.youtube.com/watch?v=5\\_8h\\_Pwy15s](https://www.youtube.com/watch?v=5_8h_Pwy15s)',
      '',
      '[https://www.youtube.com/watch?v=9f07\\_6MQ9sc&feature=youtu.be](https://www.youtube.com/watch?v=9f07_6MQ9sc&feature=youtu.be)',
      '',
      'et après',
    ].join('\n'));
  });

  test('multiple links', () => {
    const r = fromHTMLToMarkdown([
      '<p>Nothing worked. Here is a first one: <a href="https://le_monde.fr">https://le_monde.fr</a></p>',
      '<p>And the same <a href="https://le_monde.fr">https://le_monde.fr</a></p>',
      '<p></p>',
      '<p><a href="https://le_monde.fr">https://le_monde.fr</a> and a <a href="https://www.youtube.com/watch?v=io2d_cpoLDg">https://www.youtube.com/watch?v=io2d_cpoLDg</a> link and one with a <a href="https://www.youtube.com/watch?v=io2d_cpoLDg">label</a></p>',
    ].join('\n'));

    expect(r).toBe([
      'Nothing worked. Here is a first one: [https://le\\_monde.fr](https://le_monde.fr)',
      'And the same [https://le\\_monde.fr](https://le_monde.fr)',
      '',
      '[https://le\\_monde.fr](https://le_monde.fr) and a [https://www.youtube.com/watch?v=io2d\\_cpoLDg](https://www.youtube.com/watch?v=io2d_cpoLDg) link and one with a [label](https://www.youtube.com/watch?v=io2d_cpoLDg)',
    ].join('\n'));
  });

  test('emails are also automatically extracted', () => {
    const r = fromHTMLToMarkdown([
      '<p>kaore@openagenda.com le texte après l\'email</p>',
      '<p></p>',
    ].join(''));

    expect(r).toBe('[kaore@openagenda.com](mailto:kaore@openagenda.com) le texte après l\'email');
  });

  test('emails in italic sentences are extracted too', () => {
    expect(
      fromHTMLToMarkdown(
        '<p><em>kaore@openagenda.com voilà mon email</em></p>',
      ),
    ).toBe(
      '_[kaore@openagenda.com](mailto:kaore@openagenda.com) voilà mon email_',
    );
  });

  test('fix: unexpected conversion when handling protocol-less links', () => {
    expect(
      fromHTMLToMarkdown(
        '<p>Chez</p><p>www.openagenda.com</p>',
      ),
    ).toBeTruthy();
  });

  test('scripts tags are filtered out', () => {
    expect(
      fromHTMLToMarkdown('<p>Here is a script: <script>alert("fiddlesnouts")</script></p>'),
    ).toBe('Here is a script: alert("fiddlesnouts")');
  });
});
