"use string";

const utils = require('../');
const fs = require('fs');
const dirty = fs.readFileSync(__dirname + '/dirty.txt', 'utf-8');
const clean = fs.readFileSync(__dirname + '/clean.txt', 'utf-8');

describe('utils.cleanString', () => {

  it('cleans', () => {
    const dirtyChars = dirty.split('\n');

    dirtyChars.pop(); // remove end of file new line

    dirtyChars.forEach(dirtyChar => {
      expect(utils.cleanString(dirtyChar)).toBe(` `);
    });
  });

  it('does not clean', () => {

    clean.split(';').forEach(cleanChar => {

      expect(utils.cleanString(cleanChar)).toBe(cleanChar);

    });

  });


});
