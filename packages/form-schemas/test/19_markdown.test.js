'use strict';

const fs = require('fs');
const markdown = require('../iso/markdown');
const {
  fr: withSubtitle
} = require('./markdown/withSubtitle.json');

const withSubtitleHTML = fs.readFileSync(`${__dirname}/markdown/withSubtitle.html`, 'utf-8');

describe('unit - markdown', () => {
  describe('markdown.to', () => {
    it('basic', () => {
      expect(
        markdown.to('<h1>Yeay</h1>')
      ).toBe('Yeay\n====');
    });

    it('with a link as paragraph', () => {
      const r = markdown.to(`
        <p>Un lien en texte:</p>
        <p>https://le_monde.fr</p>
        <p>Un autre: https://le_monde.fr</p>
        <p>Puis un déjà en markdown: <a href="https://le_monde.fr">Le label</a></p>
      `);

      expect(r).toBe([
        'Un lien en texte:',
        '[https://le\\_monde.fr](https://le_monde.fr)',
        'Un autre: [https://le\\_monde.fr](https://le_monde.fr)',
        'Puis un déjà en markdown: [Le label](https://le_monde.fr)'
      ].join('\n'));
    });

    it('links with & are properly replaced', () => {
      const r = markdown.to([
        '<p>Avant</p>',
        '<p>https://www.youtube.com/watch?v=5_8h_Pwy15s</p>',
        '<p></p>',
        '<p>https://www.youtube.com/watch?v=9f07_6MQ9sc&amp;feature=youtu.be</p>',
        '<p></p>',
        '<p>et après</p>'
      ].join(''));

      expect(r).toBe([
        'Avant',
        '[https://www.youtube.com/watch?v=5\\_8h\\_Pwy15s](https://www.youtube.com/watch?v=5_8h_Pwy15s)',
        '',
        '[https://www.youtube.com/watch?v=9f07\\_6MQ9sc&feature=youtu.be](https://www.youtube.com/watch?v=9f07_6MQ9sc&feature=youtu.be)',
        '',
        'et après'
      ].join('\n'));
    });

    it('multiple links', () => {
      const r = markdown.to([
        '<p>Nothing worked. Here is a first one: <a href="https://le_monde.fr">https://le_monde.fr</a></p>',
        '<p>And the same <a href="https://le_monde.fr">https://le_monde.fr</a></p>',
        '<p></p>',
        '<p><a href="https://le_monde.fr">https://le_monde.fr</a> and a <a href="https://www.youtube.com/watch?v=io2d_cpoLDg">https://www.youtube.com/watch?v=io2d_cpoLDg</a> link and one with a <a href="https://www.youtube.com/watch?v=io2d_cpoLDg">label</a></p>'
      ].join('\n'));

      expect(r).toBe([
        'Nothing worked. Here is a first one: [https://le\\_monde.fr](https://le_monde.fr)',
        'And the same [https://le\\_monde.fr](https://le_monde.fr)',
        '',
        '[https://le\\_monde.fr](https://le_monde.fr) and a [https://www.youtube.com/watch?v=io2d\\_cpoLDg](https://www.youtube.com/watch?v=io2d_cpoLDg) link and one with a [label](https://www.youtube.com/watch?v=io2d_cpoLDg)'
      ].join('\n'));
    });

    it('emails are also automatically extracted', () => {
      const r = markdown.to([
        '<p>kaore@openagenda.com le texte après l\'email</p>',
        '<p></p>'
      ].join(''));

      expect(r).toBe('[kaore@openagenda.com](mailto:kaore@openagenda.com) le texte après l\'email');
    });

    it('emails in italic sentences are extracted too', () => {
      expect(
        markdown.to('<p><em>kaore@openagenda.com voilà mon email</em></p>')
      ).toBe(
        '_[kaore@openagenda.com](mailto:kaore@openagenda.com) voilà mon email_'
      );
    });
  });

  describe('markdown.from', () => {
    it('from can handle nothingness', () => {
      expect(markdown.from()).toBe('');
    });

    it('basic', () => {
      expect(
        markdown.from('Yeay\n====')
      ).toBe(
        '<h1>Yeay</h1>\n'
      );
    });

    it('href are maintained in links', () => {
      expect(
        markdown.from('Here is a link: [Kaoré](https://kao.re)')
      ).toBe(
        '<p>Here is a link: <a href="https://kao.re">Kaoré</a></p>\n'
      );
    });

    it('A line break inserts a <br />', () => {
      const r = markdown.from([
        'Here is a line',
        'Next line'
      ].join('\n'));

      expect(r).toBe('<p>Here is a line<br />Next line</p>\n');
    });

    it('multiple links', () => {
      const r = markdown.from([
        'Nothing worked. Here is a first one: [https://le_monde.fr](https://le_monde.fr)',
        'And the same [https://le_monde.fr](https://le_monde.fr)',
        '',
        '[https://le_monde.fr](https://le_monde.fr) and a [https://www.youtube.com/watch?v=io2d_cpoLDg](https://www.youtube.com/watch?v=io2d_cpoLDg) link and one with a [label](https://www.youtube.com/watch?v=io2d_cpoLDg)'
      ].join('\n'));

      expect(r).toBe([
        '<p>Nothing worked. Here is a first one: <a href="https://le_monde.fr">https://le_monde.fr</a><br />And the same <a href="https://le_monde.fr">https://le_monde.fr</a></p>',
        '<p></p>',
        '<p><a href="https://le_monde.fr">https://le_monde.fr</a> and a <a href="https://www.youtube.com/watch?v=io2d_cpoLDg">https://www.youtube.com/watch?v=io2d_cpoLDg</a> link and one with a <a href="https://www.youtube.com/watch?v=io2d_cpoLDg">label</a></p>',
        ''
      ].join('\n'));
    });

    it('list', () => {
      const r = markdown.from(`A list

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

    it('Subtitle', () => {
      expect(
        markdown.from(withSubtitle)
      ).toBe(
        withSubtitleHTML
      );
    });
  });
});
