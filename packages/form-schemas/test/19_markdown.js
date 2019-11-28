'use strict';

const should = require('should');
const markdown = require('../iso/markdown');

describe('unit - markdown', () => {

  describe('markdown.to', () => {

    it('basic', () => {
      markdown.to('<h1>Yeay</h1>').should.equal('Yeay\n====');
    });

  });

  describe('markdown.from', () => {

    it('basic', () => {
      markdown.from('Yeay\n====').should.equal('<h1>Yeay</h1>\n');
    });

    it('href are maintained in links', () => {
      markdown.from('Here is a link: [Kaoré](https://kao.re)').should.equal('<p>Here is a link: <a href="https://kao.re">Kaoré</a></p>\n');
    });

  });

});
