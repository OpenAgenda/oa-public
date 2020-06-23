'use strict';

const should = require('should');
const markdown = require('../iso/markdown');
const marked = require('marked');

describe('unit - markdown', () => {

  describe('markdown.to', () => {

    it('basic', () => {
      markdown.to('<h1>Yeay</h1>').should.equal('Yeay\n====');
    });

    it('with a link as paragraph', () => {
      const r = markdown.to(`
        <p>Un lien en texte:</p>
        <p>https://le_monde.fr</p>
        <p>Un autre: https://le_monde.fr</p>
        <p>Puis un déjà en markdown: <a href="https://le_monde.fr">Le label</a></p>
      `);
    });

  });

  describe('markdown.from', () => {

    it('basic', () => {
      markdown.from('Yeay\n====').should.equal('<h1>Yeay</h1>\n');
    });

    it('href are maintained in links', () => {
      markdown.from('Here is a link: [Kaoré](https://kao.re)').should.equal('<p>Here is a link: <a href="https://kao.re">Kaoré</a></p>\n');
    });

    it('the href of a markdowned link with an underscore should be except of the _ escape', () => {
      const r = markdown.from('http://le\\_monde.fr');

      r.should.equal('<p><a href="http://le_monde.fr">http://le_monde.fr</a></p>\n');
    });

  });

});
