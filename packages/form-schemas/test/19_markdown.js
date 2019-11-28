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

  });

});
